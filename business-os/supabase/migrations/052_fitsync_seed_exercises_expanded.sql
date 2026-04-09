-- ============================================================
-- FitSync AI — Expanded Exercise Library: 120+ additional exercises
-- Run AFTER 051_fitsync_seed_exercises.sql
-- ============================================================

INSERT INTO fs_exercises (id, name, name_es, muscle_group, secondary_muscles, equipment, exercise_type, instructions_es) VALUES

-- ═══ CHEST (Additional) ═══════════════════════════════════════
('ex-110', 'Pec Deck Machine', 'Pec deck', 'chest', ARRAY[]::text[], 'machine', 'isolation', 'Siéntate con el pecho contra el respaldo. Agarra las manijas con codos a 90° y presiona juntas.'),
('ex-111', 'Smith Machine Bench Press', 'Press banca en Smith', 'chest', ARRAY['triceps','shoulders'], 'machine', 'compound', 'Acuéstate bajo la barra Smith. Desbloquea y presiona hacia arriba con control.'),
('ex-112', 'Smith Machine Incline Press', 'Press inclinado en Smith', 'chest', ARRAY['triceps','shoulders'], 'machine', 'compound', 'Banco a 45° bajo Smith. Presiona hacia arriba enfatizando pecho superior.'),
('ex-113', 'Landmine Press', 'Press landmine', 'chest', ARRAY['shoulders','triceps'], 'barbell', 'compound', 'Barra en landmine, agarra el extremo al hombro. Presiona en ángulo de 45°.'),
('ex-114', 'Incline Dumbbell Fly', 'Apertura inclinada con mancuernas', 'chest', ARRAY['shoulders'], 'dumbbell', 'isolation', 'Banco inclinado, brazos extendidos. Baja en arco manteniendo codos ligeramente flexionados.'),
('ex-115', 'Cable Fly Low-to-High', 'Cruce de cables bajo a alto', 'chest', ARRAY['shoulders'], 'cable', 'isolation', 'Poleas bajas, cruza los cables hacia arriba al frente del pecho enfatizando parte superior.'),
('ex-116', 'Cable Fly High-to-Low', 'Cruce de cables alto a bajo', 'chest', ARRAY[]::text[], 'cable', 'isolation', 'Poleas altas, cruza hacia abajo enfatizando pecho inferior.'),
('ex-117', 'Svend Press', 'Press Svend', 'chest', ARRAY[]::text[], 'bodyweight', 'isolation', 'De pie, aprieta dos discos entre las palmas al nivel del pecho. Extiende y contrae.'),

-- ═══ BACK (Additional) ════════════════════════════════════════
('ex-118', 'Chest Supported Row', 'Remo con apoyo de pecho', 'back', ARRAY['biceps'], 'dumbbell', 'compound', 'Boca abajo en banco inclinado, jala las mancuernas hacia la cadera apretando omóplatos.'),
('ex-119', 'Seal Row', 'Remo sello', 'back', ARRAY['biceps'], 'barbell', 'compound', 'Boca abajo en banco alto, jala la barra sin impulso de piernas.'),
('ex-120', 'Meadows Row', 'Remo Meadows', 'back', ARRAY['biceps','core'], 'barbell', 'compound', 'Barra en landmine, agarre pronado de un brazo. Jala explosivamente hacia la cadera.'),
('ex-121', 'Straight Arm Pulldown', 'Jalón con brazos rectos', 'back', ARRAY[]::text[], 'cable', 'isolation', 'Polea alta, brazos rectos. Jala la barra hacia los muslos apretando dorsales.'),
('ex-122', 'Single Arm Lat Pulldown', 'Jalón unilateral', 'back', ARRAY['biceps'], 'cable', 'compound', 'Polea alta, un brazo a la vez. Jala hacia el costado apretando el dorsal.'),
('ex-123', 'Inverted Row', 'Remo invertido', 'back', ARRAY['biceps','core'], 'bodyweight', 'compound', 'Cuelga bajo una barra baja, cuerpo recto. Jala el pecho hacia la barra.'),
('ex-124', 'Rack Pull', 'Peso muerto parcial', 'back', ARRAY['glutes','hamstrings'], 'barbell', 'compound', 'Barra a la altura de rodillas en rack. Levanta enfocando espalda superior y trapecios.'),
('ex-125', 'Pendlay Row', 'Remo Pendlay', 'back', ARRAY['biceps','core'], 'barbell', 'compound', 'Torso paralelo al suelo, barra en el piso. Jala explosivamente al pecho y baja al piso cada rep.'),
('ex-126', 'Reverse Grip Lat Pulldown', 'Jalón agarre supino', 'back', ARRAY['biceps'], 'cable', 'compound', 'Polea alta, agarre supino. Jala hacia el pecho enfatizando dorsales inferiores.'),

-- ═══ SHOULDERS (Additional) ═══════════════════════════════════
('ex-127', 'Landmine Shoulder Press', 'Press de hombro landmine', 'shoulders', ARRAY['triceps','core'], 'barbell', 'compound', 'Barra en landmine a la altura del hombro. Presiona en ángulo ascendente.'),
('ex-128', 'Dumbbell Y Raise', 'Elevación en Y', 'shoulders', ARRAY['back'], 'dumbbell', 'isolation', 'Inclinado o boca abajo, sube las mancuernas en forma de Y con pulgares arriba.'),
('ex-129', 'Plate Front Raise', 'Elevación frontal con disco', 'shoulders', ARRAY[]::text[], 'barbell', 'isolation', 'De pie, sostén un disco con ambas manos. Eleva al frente hasta altura de ojos.'),
('ex-130', 'Cable Face Pull', 'Face pull con cable', 'shoulders', ARRAY['back'], 'cable', 'isolation', 'Polea alta con cuerda. Jala hacia la cara con codos altos, rota externamente al final.'),
('ex-131', 'Band Pull Apart', 'Separación de banda', 'shoulders', ARRAY['back'], 'band', 'isolation', 'Banda frente al pecho, brazos rectos. Separa la banda abriendo los brazos.'),
('ex-132', 'Lu Raise', 'Elevación Lu', 'shoulders', ARRAY[]::text[], 'dumbbell', 'isolation', 'Elevación lateral con brazos ligeramente al frente (30° del plano lateral). Pulgares hacia arriba.'),
('ex-133', 'Machine Rear Delt Fly', 'Vuelo posterior en máquina', 'shoulders', ARRAY['back'], 'machine', 'isolation', 'Pec deck invertido. Abre los brazos hacia atrás enfocando deltoides posterior.'),
('ex-134', 'Barbell Front Raise', 'Elevación frontal con barra', 'shoulders', ARRAY[]::text[], 'barbell', 'isolation', 'De pie con barra agarre prono. Eleva al frente hasta altura de hombros.'),

-- ═══ BICEPS (Additional) ══════════════════════════════════════
('ex-135', 'Incline Dumbbell Curl', 'Curl inclinado con mancuernas', 'biceps', ARRAY['forearms'], 'dumbbell', 'isolation', 'Banco a 45°, brazos colgando. Curl desde extensión completa para máximo estiramiento.'),
('ex-136', 'Spider Curl', 'Curl araña', 'biceps', ARRAY[]::text[], 'dumbbell', 'isolation', 'Boca abajo en banco inclinado, brazos colgando al frente. Curl sin impulso.'),
('ex-137', 'EZ Bar Curl', 'Curl con barra EZ', 'biceps', ARRAY['forearms'], 'barbell', 'isolation', 'De pie con barra EZ. Flexiona los codos manteniendo muñecas en posición neutra.'),
('ex-138', 'Bayesian Cable Curl', 'Curl Bayesiano con cable', 'biceps', ARRAY[]::text[], 'cable', 'isolation', 'De espaldas a la polea baja, brazo extendido atrás. Curl con máximo estiramiento.'),
('ex-139', 'Cross Body Hammer Curl', 'Curl martillo cruzado', 'biceps', ARRAY['forearms'], 'dumbbell', 'isolation', 'Curl martillo cruzando la mancuerna al frente del cuerpo hacia el hombro opuesto.'),
('ex-140', 'Machine Preacher Curl', 'Curl predicador en máquina', 'biceps', ARRAY[]::text[], 'machine', 'isolation', 'Máquina predicador, codos en el pad. Curl controlado enfocando contracción.'),
('ex-141', 'Drag Curl', 'Curl arrastre', 'biceps', ARRAY[]::text[], 'barbell', 'isolation', 'De pie con barra. Sube la barra pegada al cuerpo llevando los codos hacia atrás.'),

-- ═══ TRICEPS (Additional) ═════════════════════════════════════
('ex-142', 'Cable Overhead Extension (Rope)', 'Extensión sobre cabeza con cuerda', 'triceps', ARRAY[]::text[], 'cable', 'isolation', 'De espaldas a polea alta con cuerda. Extiende sobre la cabeza manteniendo codos fijos.'),
('ex-143', 'Tricep Pushdown (V-Bar)', 'Empuje con barra V', 'triceps', ARRAY[]::text[], 'cable', 'isolation', 'Polea alta con barra V. Empuja hacia abajo manteniendo codos pegados al cuerpo.'),
('ex-144', 'JM Press', 'Press JM', 'triceps', ARRAY['chest'], 'barbell', 'compound', 'Acostado, baja la barra combinando skull crusher con press cerrado. Codos a 45°.'),
('ex-145', 'Bench Dip', 'Fondos en banco', 'triceps', ARRAY['chest','shoulders'], 'bodyweight', 'compound', 'Manos en banco atrás, pies en el suelo. Baja flexionando codos y empuja.'),
('ex-146', 'Single Arm Cable Pushdown', 'Empuje unilateral con cable', 'triceps', ARRAY[]::text[], 'cable', 'isolation', 'Polea alta, un brazo. Empuja hacia abajo rotando la muñeca al final.'),
('ex-147', 'Tate Press', 'Press Tate', 'triceps', ARRAY[]::text[], 'dumbbell', 'isolation', 'Acostado con mancuernas, codos apuntando afuera. Extiende desde el pecho hacia arriba.'),

-- ═══ QUADRICEPS (Additional) ══════════════════════════════════
('ex-148', 'Smith Machine Squat', 'Sentadilla en Smith', 'quadriceps', ARRAY['glutes','hamstrings'], 'machine', 'compound', 'De pie bajo Smith, pies ligeramente adelante. Sentadilla con guía de la barra.'),
('ex-149', 'Sissy Squat', 'Sentadilla sissy', 'quadriceps', ARRAY[]::text[], 'bodyweight', 'isolation', 'De pie, inclínate hacia atrás flexionando rodillas. Baja manteniendo caderas extendidas.'),
('ex-150', 'Pistol Squat', 'Sentadilla pistola', 'quadriceps', ARRAY['glutes','core'], 'bodyweight', 'compound', 'De pie en una pierna, extiende la otra al frente. Baja hasta abajo y sube.'),
('ex-151', 'Step Up', 'Subida al cajón', 'quadriceps', ARRAY['glutes'], 'dumbbell', 'compound', 'Con mancuernas, sube a un cajón con un pie. Empuja con la pierna de arriba.'),
('ex-152', 'Belt Squat', 'Sentadilla con cinturón', 'quadriceps', ARRAY['glutes','hamstrings'], 'machine', 'compound', 'Peso colgado del cinturón de cadera. Sentadilla sin carga en la espalda.'),
('ex-153', 'V-Squat Machine', 'Sentadilla V', 'quadriceps', ARRAY['glutes'], 'machine', 'compound', 'En la máquina V-squat con pies en plataforma. Sentadilla con movimiento guiado.'),
('ex-154', 'Pendulum Squat', 'Sentadilla péndulo', 'quadriceps', ARRAY['glutes'], 'machine', 'compound', 'Máquina péndulo. Sentadilla con arco natural que reduce estrés en la espalda.'),
('ex-155', 'Reverse Lunge', 'Zancada reversa', 'quadriceps', ARRAY['glutes','hamstrings'], 'dumbbell', 'compound', 'Con mancuernas, da un paso atrás y baja la rodilla al suelo. Más seguro que zancada frontal.'),

-- ═══ HAMSTRINGS (Additional) ══════════════════════════════════
('ex-156', 'Lying Leg Curl', 'Curl femoral acostado', 'hamstrings', ARRAY[]::text[], 'machine', 'isolation', 'Boca abajo en máquina. Flexiona llevando talones a glúteos con control.'),
('ex-157', 'Seated Leg Curl', 'Curl femoral sentado', 'hamstrings', ARRAY[]::text[], 'machine', 'isolation', 'Sentado en máquina, piernas extendidas. Flexiona hacia abajo con control.'),
('ex-158', 'Standing Leg Curl', 'Curl femoral de pie', 'hamstrings', ARRAY[]::text[], 'machine', 'isolation', 'De pie en máquina. Flexiona una pierna a la vez llevando talón al glúteo.'),
('ex-159', 'Stiff Leg Deadlift', 'Peso muerto piernas rígidas', 'hamstrings', ARRAY['back','glutes'], 'barbell', 'compound', 'Piernas completamente rectas. Baja la barra sintiendo estiramiento máximo en isquios.'),
('ex-160', 'Single Leg RDL', 'Peso muerto rumano unilateral', 'hamstrings', ARRAY['glutes','core'], 'dumbbell', 'compound', 'De pie en una pierna, inclínate con la otra pierna extendiéndose atrás. Equilibrio + isquios.'),
('ex-161', 'Cable Pull Through', 'Tracción con cable', 'hamstrings', ARRAY['glutes'], 'cable', 'compound', 'De espaldas a polea baja, cuerda entre piernas. Bisagra de cadera y extiende.'),

-- ═══ GLUTES (Additional) ══════════════════════════════════════
('ex-162', 'Machine Hip Thrust', 'Hip thrust en máquina', 'glutes', ARRAY['hamstrings'], 'machine', 'compound', 'Máquina específica de hip thrust. Empuja la cadera hacia arriba contra la resistencia.'),
('ex-163', 'Reverse Hyperextension', 'Hiperextensión inversa', 'glutes', ARRAY['hamstrings','back'], 'machine', 'isolation', 'Torso en máquina, piernas colgando. Sube las piernas apretando glúteos.'),
('ex-164', 'Machine Abductor', 'Máquina abductora', 'glutes', ARRAY[]::text[], 'machine', 'isolation', 'Sentado, piernas en pads. Abre las piernas contra la resistencia.'),
('ex-165', 'Machine Adductor', 'Máquina aductora', 'glutes', ARRAY[]::text[], 'machine', 'isolation', 'Sentado, piernas abiertas en pads. Cierra las piernas contra la resistencia.'),
('ex-166', 'Frog Pump', 'Bomba de rana', 'glutes', ARRAY[]::text[], 'bodyweight', 'isolation', 'Acostado, plantas de los pies juntas, rodillas abiertas. Sube la cadera apretando glúteos.'),
('ex-167', 'Single Leg Hip Thrust', 'Hip thrust unilateral', 'glutes', ARRAY['hamstrings','core'], 'bodyweight', 'compound', 'Espalda en banco, una pierna extendida. Empuja con una pierna.'),

-- ═══ TRAPEZIUS ═════════════════════════════════════════════════
('ex-168', 'Barbell Shrug', 'Encogimientos con barra', 'back', ARRAY[]::text[], 'barbell', 'isolation', 'De pie con barra, encoge los hombros hacia las orejas. Mantén arriba y baja controlado.'),
('ex-169', 'Dumbbell Shrug', 'Encogimientos con mancuernas', 'back', ARRAY[]::text[], 'dumbbell', 'isolation', 'De pie con mancuernas a los lados. Encoge hombros hacia arriba.'),
('ex-170', 'Cable Shrug', 'Encogimientos con cable', 'back', ARRAY[]::text[], 'cable', 'isolation', 'Polea baja, agarre a los lados. Encoge hombros con tensión constante.'),
('ex-171', 'Smith Machine Shrug', 'Encogimientos en Smith', 'back', ARRAY[]::text[], 'machine', 'isolation', 'Bajo barra Smith. Encoge hombros con movimiento guiado.'),

-- ═══ CALVES (Additional) ══════════════════════════════════════
('ex-172', 'Smith Machine Calf Raise', 'Elevación de talones en Smith', 'calves', ARRAY[]::text[], 'machine', 'isolation', 'Bajo barra Smith, puntas de pies en plataforma. Sube talones con carga.'),
('ex-173', 'Donkey Calf Raise', 'Elevación de talones tipo burro', 'calves', ARRAY[]::text[], 'machine', 'isolation', 'Inclinado con carga en la cadera. Eleva talones enfocando en estiramiento completo.'),
('ex-174', 'Leg Press Calf Raise', 'Elevación de talones en prensa', 'calves', ARRAY[]::text[], 'machine', 'isolation', 'En prensa de piernas, pies al borde. Empuja con puntas de pies.'),
('ex-175', 'Single Leg Calf Raise', 'Elevación de talón unilateral', 'calves', ARRAY[]::text[], 'bodyweight', 'isolation', 'En escalón, una pierna. Baja el talón por debajo y sube al máximo.'),

-- ═══ CORE (Additional) ════════════════════════════════════════
('ex-176', 'Decline Sit-Up', 'Sit-up declinado', 'core', ARRAY[]::text[], 'bodyweight', 'isolation', 'Banco declinado, pies asegurados. Sube el torso hacia las rodillas.'),
('ex-177', 'Pallof Press', 'Press Pallof', 'core', ARRAY[]::text[], 'cable', 'isolation', 'De pie junto a polea a la altura del pecho. Extiende brazos al frente resistiendo la rotación.'),
('ex-178', 'Cable Woodchop High-to-Low', 'Corte de leña alto a bajo', 'core', ARRAY['shoulders'], 'cable', 'compound', 'Polea alta, gira el torso jalando en diagonal hacia la rodilla opuesta.'),
('ex-179', 'Cable Woodchop Low-to-High', 'Corte de leña bajo a alto', 'core', ARRAY['shoulders'], 'cable', 'compound', 'Polea baja, gira el torso empujando en diagonal hacia arriba.'),
('ex-180', 'Hanging Knee Raise', 'Elevación de rodillas colgado', 'core', ARRAY['forearms'], 'bodyweight', 'isolation', 'Colgado de barra, sube las rodillas al pecho con control.'),
('ex-181', 'V-Up', 'V-up', 'core', ARRAY[]::text[], 'bodyweight', 'isolation', 'Acostado, sube piernas y torso simultáneamente formando una V. Toca los pies.'),
('ex-182', 'Side Plank', 'Plancha lateral', 'core', ARRAY[]::text[], 'bodyweight', 'isolation', 'De lado, apoyado en antebrazo. Mantén el cuerpo recto con cadera arriba.'),
('ex-183', 'Dragon Flag', 'Bandera del dragón', 'core', ARRAY[]::text[], 'bodyweight', 'isolation', 'Acostado en banco, agarra detrás de la cabeza. Levanta el cuerpo recto usando solo el core.'),
('ex-184', 'L-Sit Hold', 'L-sit', 'core', ARRAY['shoulders'], 'bodyweight', 'isolation', 'En paralelas o barras, sostén el cuerpo con piernas extendidas al frente en L.'),
('ex-185', 'Bicycle Crunch', 'Crunch bicicleta', 'core', ARRAY[]::text[], 'bodyweight', 'isolation', 'Acostado, alterna codo a rodilla opuesta en movimiento de pedaleo.'),

-- ═══ LOWER BACK / ERECTORS ════════════════════════════════════
('ex-186', 'Back Extension (45°)', 'Hiperextensión a 45°', 'back', ARRAY['glutes','hamstrings'], 'bodyweight', 'isolation', 'En banco de hiperextensión a 45°, baja el torso y sube apretando espalda baja.'),
('ex-187', 'Back Extension (90°)', 'Hiperextensión a 90°', 'back', ARRAY['glutes','hamstrings'], 'bodyweight', 'isolation', 'En banco de hiperextensión horizontal. Mayor rango de movimiento.'),
('ex-188', 'Superman', 'Superman', 'back', ARRAY['glutes'], 'bodyweight', 'isolation', 'Boca abajo, levanta brazos y piernas simultáneamente. Mantén y baja.'),
('ex-189', 'Barbell Good Morning (Wide Stance)', 'Buenos días sumo', 'back', ARRAY['hamstrings','glutes'], 'barbell', 'compound', 'Piernas abiertas, barra en trapecios. Inclínate enfatizando glúteos y espalda.'),

-- ═══ FULL BODY / OLYMPIC ══════════════════════════════════════
('ex-190', 'Power Clean', 'Cargada de potencia', 'full_body', ARRAY['quadriceps','shoulders','back'], 'barbell', 'compound', 'Barra en el piso, jala explosivamente hasta los hombros atrapando en posición frontal.'),
('ex-191', 'Hang Clean', 'Cargada colgante', 'full_body', ARRAY['quadriceps','shoulders'], 'barbell', 'compound', 'Barra a la altura de rodillas, jala explosivamente a los hombros.'),
('ex-192', 'Snatch', 'Arranque', 'full_body', ARRAY['shoulders','quadriceps','back'], 'barbell', 'compound', 'Barra del piso a sobre la cabeza en un movimiento. Agarre ancho.'),
('ex-193', 'Push Press', 'Press con impulso', 'full_body', ARRAY['shoulders','triceps','quadriceps'], 'barbell', 'compound', 'Barra en hombros, ligera flexión de rodillas e impulso para presionar sobre la cabeza.'),
('ex-194', 'Wall Ball', 'Lanzamiento a la pared', 'full_body', ARRAY['quadriceps','shoulders','core'], 'bodyweight', 'compound', 'Con balón medicinal, sentadilla y lanza el balón alto a un target en la pared.'),
('ex-195', 'Devil Press', 'Devil press', 'full_body', ARRAY['chest','shoulders','quadriceps'], 'dumbbell', 'compound', 'Burpee con mancuernas + snatch con ambas mancuernas sobre la cabeza.'),
('ex-196', 'Rowing Machine', 'Máquina de remo', 'full_body', ARRAY['back','quadriceps','core'], 'machine', 'cardio', 'Sentado, empuja con piernas primero, luego jala con espalda y brazos. Movimiento fluido.'),
('ex-197', 'Assault Bike', 'Bicicleta de asalto', 'full_body', ARRAY['quadriceps','shoulders'], 'machine', 'cardio', 'Pedalea contra resistencia de aire. Usa brazos y piernas. Más esfuerzo = más resistencia.'),
('ex-198', 'Jump Rope', 'Saltar la cuerda', 'full_body', ARRAY['calves','core'], 'bodyweight', 'cardio', 'Salta la cuerda con saltos cortos. Muñecas giran la cuerda, no los brazos.'),
('ex-199', 'SkiErg', 'SkiErg', 'full_body', ARRAY['back','core','shoulders'], 'machine', 'cardio', 'De pie, jala las manijas hacia abajo en movimiento de esquí. Bisagra de cadera al bajar.'),
('ex-200', 'Medicine Ball Slam', 'Azote con balón medicinal', 'full_body', ARRAY['core','shoulders'], 'bodyweight', 'compound', 'Balón sobre la cabeza, azota contra el suelo con máxima fuerza. Agáchate a recoger.'),

-- ═══ BODYWEIGHT AVANZADO ══════════════════════════════════════
('ex-201', 'Muscle Up', 'Muscle up', 'back', ARRAY['chest','triceps'], 'bodyweight', 'compound', 'Dominada explosiva que transiciona a un fondo sobre la barra.'),
('ex-202', 'Handstand Push-Up', 'Flexión en parada de manos', 'shoulders', ARRAY['triceps','core'], 'bodyweight', 'compound', 'Parada de manos contra pared. Baja la cabeza al suelo y empuja.'),
('ex-203', 'Archer Pull-Up', 'Dominada arquero', 'back', ARRAY['biceps'], 'bodyweight', 'compound', 'Dominada hacia un lado manteniendo el otro brazo extendido. Alterna lados.'),
('ex-204', 'Pike Push-Up', 'Flexión pike', 'shoulders', ARRAY['triceps'], 'bodyweight', 'compound', 'Posición de V invertida, baja la cabeza al suelo. Progresión hacia HSPU.'),
('ex-205', 'Hindu Push-Up', 'Flexión hindú', 'chest', ARRAY['shoulders','core'], 'bodyweight', 'compound', 'De perro boca abajo, desliza el pecho cerca del suelo y sube a cobra. Movimiento fluido.'),

-- ═══ ROTATOR CUFF & REHAB ════════════════════════════════════
('ex-206', 'Cable External Rotation', 'Rotación externa con cable', 'shoulders', ARRAY[]::text[], 'cable', 'isolation', 'Codo pegado al cuerpo a 90°, rota el antebrazo hacia afuera contra la resistencia del cable.'),
('ex-207', 'Band External Rotation', 'Rotación externa con banda', 'shoulders', ARRAY[]::text[], 'band', 'isolation', 'Codo a 90°, banda en la mano. Rota hacia afuera manteniendo codo fijo.'),
('ex-208', 'Band Dislocate', 'Dislocación con banda', 'shoulders', ARRAY['back'], 'band', 'flexibility', 'Banda ancha frente al cuerpo, pásala sobre la cabeza hacia atrás. Mejora movilidad.'),
('ex-209', 'Face Pull with External Rotation', 'Face pull con rotación externa', 'shoulders', ARRAY['back'], 'cable', 'isolation', 'Face pull normal pero al final rota externamente como si hicieras doble bíceps.')

ON CONFLICT (id) DO NOTHING;
