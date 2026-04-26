// BidHunter Chrome Extension — Popup Logic
// Uses scrapeAndSend so the content script handles the server call
// (popup closing won't kill the request)

var $ = function(sel) { return document.querySelector(sel); };

chrome.storage.local.get(['serverUrl', 'extensionKey'], function(data) {
  $('#serverUrl').value = data.serverUrl || 'http://localhost:3000';
  $('#extensionKey').value = data.extensionKey || '';
});

$('#serverUrl').addEventListener('change', function() {
  chrome.storage.local.set({ serverUrl: $('#serverUrl').value.replace(/\/+$/, '') });
});

$('#extensionKey').addEventListener('change', function() {
  chrome.storage.local.set({ extensionKey: $('#extensionKey').value.trim() });
});

chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  var tab = tabs[0];
  var isBC = tab && tab.url && tab.url.indexOf('buildingconnected.com') !== -1;

  if (!isBC) {
    $('#notBc').style.display = 'block';
    $('#main').style.display = 'none';
    $('#statusDot').style.background = '#ef4444';
    return;
  }

  $('#main').style.display = 'block';
  $('#notBc').style.display = 'none';

  if (tab.url.indexOf('bid-board') !== -1 || tab.url.indexOf('pipeline') !== -1 || tab.url.indexOf('opportunities') !== -1) {
    $('#pageStatus').textContent = '✓ On scrapable page — ready to scrape';
    $('#statusDot').style.background = '#22c55e';
  } else {
    $('#pageStatus').textContent = 'Navigate to Bid Board, Pipeline, or Opportunities';
    $('#statusDot').style.background = '#f59e0b';
  }
});

$('#scrapeBtn').addEventListener('click', function() {
  var btn = $('#scrapeBtn');
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner"></div> Scraping...';
  $('#result').innerHTML = '';

  var serverUrl = $('#serverUrl').value.replace(/\/+$/, '');
  var extensionKey = $('#extensionKey').value.trim();

  if (!extensionKey) {
    showResult('Set the Extension Key first (matches BIDHUNTER_EXTENSION_KEY on the server).', 'error');
    btn.disabled = false;
    btn.innerHTML = '🎯 Scrape & Import';
    return;
  }

  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'scrapeAndSend', serverUrl: serverUrl, extensionKey: extensionKey }, function(response) {
      if (chrome.runtime.lastError) {
        showResult('Error: ' + chrome.runtime.lastError.message + '. Try refreshing the BC page.', 'error');
        btn.disabled = false;
        btn.innerHTML = '🎯 Scrape & Import';
        return;
      }

      if (!response || !response.success) {
        showResult('Error: ' + (response ? response.error : 'No response from page'), 'error');
        btn.disabled = false;
        btn.innerHTML = '🎯 Scrape & Import';
        return;
      }

      if (response.scraped === 0) {
        showResult('No opportunities found on this page.', 'error');
      } else {
        showResult('✓ Found ' + response.scraped + ' opportunities — sending to BidHunter server. Check the BC page for a confirmation toast.', 'success');
      }

      btn.disabled = false;
      btn.innerHTML = '🎯 Scrape & Import';
    });
  });
});

function showResult(msg, type) {
  $('#result').innerHTML = '<div class="result ' + type + '">' + msg + '</div>';
}
