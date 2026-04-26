// BidHunter Content Script — BuildingConnected Bid Board Scraper
// Parses the visible text of the Bid Board since BC uses React divs (no links, no tables)
// Sends data directly to BidHunter server (not through popup, to avoid popup close killing the request)

var US_STATES = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
  'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
  'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
  'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
  'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
  'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
  'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
  'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
  'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY',
  'District of Columbia': 'DC',
};

var STATE_NAMES = Object.keys(US_STATES);

var KNOWN_TRADES = [
  'Roofing', 'Glass & Glazing', 'Epoxy Flooring', 'Epoxy/Turf Flooring',
  'Mirrors', 'Moisture Sealing', 'Exteriors', 'Painting', 'Drywall',
  'Waterproofing', 'Carpentry', 'HVAC', 'Electrical', 'Plumbing',
  'Concrete', 'Masonry', 'Demolition', 'Insulation', 'Fire Protection',
  'Stucco', 'Metal Framing', 'Acoustical Ceilings', 'Flooring',
  'Window Restoration', 'General Restoration', 'Siding', 'Doors',
  'Specialties', 'Finishes', 'Site Work', 'Landscaping', 'Paving',
  'Structural Steel', 'Millwork', 'Cabinetry', 'Countertops',
  'Tile', 'Ceramic Tile', 'Stone', 'Metal Panels', 'Curtain Wall',
  'Storefronts', 'Aluminum', 'Caulking', 'Joint Sealants',
  'Shell Work', 'Interior Build-Out', 'General Conditions',
];

var KNOWN_TRADES_LOWER = KNOWN_TRADES.map(function(t) { return t.toLowerCase(); });

function isStateName(line) {
  return STATE_NAMES.indexOf(line) !== -1;
}

function isKnownTrade(line) {
  return KNOWN_TRADES_LOWER.indexOf(line.toLowerCase()) !== -1;
}

function bhParseDate(text) {
  if (!text || text === '-') return null;
  try {
    var clean = text.replace(/\s*(EST|EDT|CST|CDT|MST|MDT|PST|PDT)\s*/gi, '').trim();
    var d = new Date(clean);
    return isNaN(d.getTime()) ? null : d.toISOString();
  } catch (e) { return null; }
}

function scrapePage() {
  var bodyText = document.body.innerText;
  var lines = bodyText.split('\n').map(function(l) { return l.trim(); }).filter(function(l) { return l.length > 0; });

  // Find start of bid list (after column headers)
  var startIdx = -1;
  for (var i = 0; i < lines.length; i++) {
    if (lines[i] === 'Comments') {
      startIdx = i + 1;
      break;
    }
  }

  if (startIdx === -1) {
    for (var i = 0; i < lines.length; i++) {
      if (lines[i] === 'Assign') { startIdx = i + 1; break; }
    }
  }

  if (startIdx === -1) startIdx = 0;

  var opportunities = [];
  var current = null;
  var seenTitles = {};

  for (var i = startIdx; i < lines.length; i++) {
    var line = lines[i];

    // Skip known UI elements
    if (line.match(/^(Bid Board|Plan Room|Calendar|Leaderboard|Analytics|Reports|Settings|Trial Expired|Get Pro|Filtered by|View them all|Viewing|of your office|I'm following|Undecided|Accepted|Submitted|Won|Archived)/i)) continue;
    if (line === '–' || line === 'Assign' || line === 'Comments' || line === 'Name' || line === 'Due Date' || line === 'Project Size' || line === 'Location') continue;
    if (line.match(/^\d+$/) && parseInt(line) < 500) continue;

    // State name
    if (isStateName(line)) {
      if (current) {
        current.state_code = US_STATES[line];
        if (!current.location) current.location = line;
      }
      continue;
    }

    // Date (e.g., "3/17/2026")
    if (line.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
      if (current) current.deadline = line;
      continue;
    }

    // Time (e.g., "1:00 PM EST")
    if (line.match(/^\d{1,2}:\d{2}\s*(AM|PM)/i)) {
      if (current && current.deadline) {
        current.deadline = current.deadline + ' ' + line;
      }
      continue;
    }

    // Sqft number (e.g., "23,599")
    if (line.match(/^[\d,]+$/) && parseInt(line.replace(/,/g, '')) > 100) {
      if (current) current.building_sqft = parseInt(line.replace(/,/g, ''));
      continue;
    }

    // "sq. ft." marker
    if (line === 'sq. ft.') continue;

    // Known trade
    if (isKnownTrade(line)) {
      if (current) {
        if (!current.trades_required) current.trades_required = [];
        current.trades_required.push(line);
      }
      continue;
    }

    // City (short text before a state name)
    if (current && !current.city_set && line.length > 1 && line.length < 40 &&
        !line.match(/^\d/) && !line.match(/^\$/) &&
        i + 1 < lines.length && isStateName(lines[i + 1])) {
      current.location = line;
      current.city_set = true;
      continue;
    }

    // Project name (new opportunity)
    if (line.length > 3 && line.length < 200 && !line.match(/^\d/) && !line.match(/^\$/)) {
      // Skip if duplicate of previous title
      if (current && current.title === line) continue;

      // Save previous
      if (current && current.title && !seenTitles[current.title.toLowerCase()]) {
        seenTitles[current.title.toLowerCase()] = true;
        opportunities.push(formatOpp(current));
      }

      current = {
        title: line,
        trades_required: [],
        deadline: null,
        building_sqft: null,
        location: null,
        state_code: null,
        city_set: false,
      };
    }
  }

  // Last one
  if (current && current.title && !seenTitles[current.title.toLowerCase()]) {
    opportunities.push(formatOpp(current));
  }

  return opportunities;
}

function formatOpp(raw) {
  return {
    title: raw.title,
    description: null,
    gc_name: null,
    gc_contact: null,
    location: raw.location,
    state_code: raw.state_code,
    deadline: bhParseDate(raw.deadline),
    estimated_value: null,
    building_sqft: raw.building_sqft,
    trades_required: raw.trades_required && raw.trades_required.length > 0 ? raw.trades_required : null,
    is_sdvosb_eligible: false,
    source_platform: 'buildingconnected',
    source_id: null,
    scope_notes: null,
  };
}

// Try to extract the project title from a single-opportunity BC page.
// Strategy: prefer a visible <h1>, fallback to document.title minus app suffixes.
function bhExtractProjectTitle() {
  var h1s = document.querySelectorAll('h1');
  for (var i = 0; i < h1s.length; i++) {
    var t = (h1s[i].innerText || '').trim();
    if (t && t.length > 3 && t.length < 200 && !/Bid Board|Pipeline|Opportunities/i.test(t)) {
      return t;
    }
  }
  var dt = (document.title || '').trim();
  dt = dt.replace(/\s*[\|\-—]\s*BuildingConnected.*$/i, '').trim();
  return dt || null;
}

// Download the bid form .xlsx from BidHunter for the current page's opportunity.
function bhDownloadBidForm(serverUrl, extensionKey) {
  var title = bhExtractProjectTitle();
  if (!title) {
    showToast('Could not detect project title on this page.', 'error');
    return;
  }
  showToast('Generating Bid Form for: ' + title.slice(0, 60) + '…', 'success');

  fetch(serverUrl + '/api/bidhunter/bid-form?title=' + encodeURIComponent(title), {
    method: 'GET',
    headers: { 'X-Extension-Key': extensionKey || '' },
  }).then(function(res) {
    if (res.status === 404) {
      showToast('Opportunity not found in BidHunter. Scrape & score it first.', 'error');
      return null;
    }
    if (!res.ok) {
      return res.text().then(function(t) {
        showToast('Bid Form error (' + res.status + '): ' + t.slice(0, 120), 'error');
        return null;
      });
    }
    var dispo = res.headers.get('Content-Disposition') || '';
    var match = dispo.match(/filename="?([^"]+)"?/);
    var filename = (match && match[1]) || 'bid-form.xlsx';
    var total = res.headers.get('X-Bid-Total');
    var commission = res.headers.get('X-Commission');
    return res.blob().then(function(blob) {
      return { blob: blob, filename: filename, total: total, commission: commission };
    });
  }).then(function(r) {
    if (!r) return;
    var url = URL.createObjectURL(r.blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = r.filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
      URL.revokeObjectURL(url);
      a.remove();
    }, 1000);
    var msg = '✓ Bid Form descargado: ' + r.filename;
    if (r.total) msg += ' — Total $' + Number(r.total).toLocaleString();
    if (r.commission) msg += ' — Comisión $' + Number(r.commission).toLocaleString();
    showToast(msg, 'success');
  }).catch(function(err) {
    showToast('BidHunter error: ' + err.message, 'error');
  });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === 'scrape') {
    try {
      var results = scrapePage();
      sendResponse({ success: true, data: results, count: results.length });
    } catch (err) {
      sendResponse({ success: false, error: err.message });
    }
  }

  if (message.action === 'downloadBidForm') {
    try {
      bhDownloadBidForm(message.serverUrl, message.extensionKey);
      sendResponse({ success: true });
    } catch (err) {
      sendResponse({ success: false, error: err.message });
    }
    return false;
  }

  // Scrape AND send to server (all in content script, so popup closing doesn't kill it)
  if (message.action === 'scrapeAndSend') {
    var serverUrl = message.serverUrl || 'http://localhost:3000';
    var extensionKey = message.extensionKey || '';
    try {
      var results = scrapePage();
      if (results.length === 0) {
        sendResponse({ success: true, scraped: 0, imported: 0, duplicates: 0 });
        return false;
      }

      // Send to server in background (survives popup close)
      fetch(serverUrl + '/api/bidhunter/import-extension', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Extension-Key': extensionKey,
        },
        body: JSON.stringify({ opportunities: results }),
      })
      .then(function(res) {
        return res.json().then(function(data) { return { ok: res.ok, status: res.status, data: data }; });
      })
      .then(function(r) {
        if (!r.ok) {
          showToast('BidHunter error (' + r.status + '): ' + (r.data && r.data.error ? r.data.error : 'request failed'), 'error');
          return;
        }
        showToast('✓ BidHunter: ' + (r.data.imported || 0) + ' new opportunities imported' +
          (r.data.duplicates > 0 ? ' (' + r.data.duplicates + ' duplicates skipped)' : ''), 'success');
      })
      .catch(function(err) {
        showToast('BidHunter error: ' + err.message, 'error');
      });

      // Respond immediately with count (don't wait for server)
      sendResponse({ success: true, scraped: results.length, sending: true });
    } catch (err) {
      sendResponse({ success: false, error: err.message });
    }
  }

  return false;
});

function showToast(msg, type) {
  var existing = document.querySelector('#bidhunter-toast');
  if (existing) existing.remove();

  var color = type === 'success' ? '#22c55e' : '#ef4444';
  var toast = document.createElement('div');
  toast.id = 'bidhunter-toast';
  toast.innerHTML = '<div style="position:fixed;top:24px;right:24px;z-index:999999;padding:12px 20px;background:#1a1a1a;color:' + color + ';border:1px solid ' + color + '33;border-radius:12px;font-family:system-ui;font-size:13px;font-weight:600;box-shadow:0 8px 30px rgba(0,0,0,0.5);max-width:400px;">' + msg + '</div>';
  document.body.appendChild(toast);

  setTimeout(function() { toast.remove(); }, 8000);
}

// Floating badge — show on Bid Board, Pipeline, and Opportunities
if (/(bid-board|opportunities|pipeline|projects)/.test(window.location.href)) {
  if (!document.querySelector('#bidhunter-fab')) {
    var fab = document.createElement('div');
    fab.id = 'bidhunter-fab';
    fab.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:99999;display:flex;flex-direction:column;gap:8px;font-family:system-ui;';

    var badge = document.createElement('div');
    badge.style.cssText = 'padding:8px 14px;background:linear-gradient(135deg,#8b5cf6,#3b82f6);color:white;border-radius:10px;font-size:12px;font-weight:600;box-shadow:0 4px 20px rgba(139,92,246,0.4);text-align:center;';
    badge.textContent = '🎯 BidHunter Ready';
    fab.appendChild(badge);

    var dlBtn = document.createElement('button');
    dlBtn.id = 'bidhunter-dl-bid-form';
    dlBtn.style.cssText = 'padding:10px 14px;background:#10b981;color:white;border:none;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;box-shadow:0 4px 20px rgba(16,185,129,0.4);';
    dlBtn.textContent = '📥 Bid Form';
    dlBtn.addEventListener('click', function() {
      chrome.storage.local.get(['serverUrl', 'extensionKey'], function(data) {
        var serverUrl = (data.serverUrl || 'http://localhost:3000').replace(/\/+$/, '');
        var extensionKey = data.extensionKey || '';
        if (!extensionKey) {
          showToast('Set the Extension Key in the popup first.', 'error');
          return;
        }
        bhDownloadBidForm(serverUrl, extensionKey);
      });
    });
    fab.appendChild(dlBtn);

    document.body.appendChild(fab);
  }
}
