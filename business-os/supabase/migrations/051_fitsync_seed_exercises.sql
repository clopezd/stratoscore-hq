-- ============================================================
-- FitSync AI — Seed: 100 Exercise Library
-- ============================================================

INSERT INTO fs_exercises (id, name, name_es, muscle_group, secondary_muscles, equipment, exercise_type, instructions_es) VALUES
-- CHEST (8)
('ex-001', 'Bench Press', 'Press de banca', 'chest', ARRAY['triceps','shoulders'], 'barbell', 'compound', 'Acuéstate en el banco, agarra la barra a la anchura de los hombros, baja al pecho y empuja.'),
('ex-002', 'Incline Bench Press', 'Press inclinado', 'chest', ARRAY['triceps','shoulders'], 'barbell', 'compound', 'Banco a 30-45°. Baja la barra al pecho superior y empuja.'),
('ex-003', 'Dumbbell Bench Press', 'Press con mancuernas', 'chest', ARRAY['triceps','shoulders'], 'dumbbell', 'compound', 'Mancuernas a los lados del pecho, empuja hacia arriba juntándolas.'),
('ex-004', 'Dumbbell Fly', 'Aperturas con mancuernas', 'chest', ARRAY[]::text[], 'dumbbell', 'isolation', 'Brazos extendidos, baja las mancuernas en arco manteniendo codos ligeramente flexionados.'),
('ex-005', 'Cable Crossover', 'Cruce de cables', 'chest', ARRAY[]::text[], 'cable', 'isolation', 'Poleas altas, cruza los cables frente al pecho apretando el pectoral.'),
('ex-006', 'Push-Up', 'Flexiones', 'chest', ARRAY['triceps','shoulders','core'], 'bodyweight', 'compound', 'Manos al ancho de hombros, baja el pecho al suelo y empuja manteniendo el cuerpo recto.'),
('ex-007', 'Machine Chest Press', 'Press de pecho en máquina', 'chest', ARRAY['triceps'], 'machine', 'compound', 'Siéntate, agarra las manijas y empuja al frente.'),
('ex-008', 'Decline Bench Press', 'Press declinado', 'chest', ARRAY['triceps'], 'barbell', 'compound', 'Banco declinado, baja la barra al pecho inferior y empuja.'),

-- BACK (9)
('ex-010', 'Deadlift', 'Peso muerto', 'back', ARRAY['hamstrings','glutes','core'], 'barbell', 'compound', 'Pies a la anchura de caderas, agarra la barra y levanta con la espalda recta.'),
('ex-011', 'Barbell Row', 'Remo con barra', 'back', ARRAY['biceps','core'], 'barbell', 'compound', 'Inclínate 45°, jala la barra hacia el abdomen apretando los omóplatos.'),
('ex-012', 'Pull-Up', 'Dominadas', 'back', ARRAY['biceps','forearms'], 'bodyweight', 'compound', 'Agarre prono, jala el cuerpo hasta que la barbilla pase la barra.'),
('ex-013', 'Lat Pulldown', 'Jalón al pecho', 'back', ARRAY['biceps'], 'cable', 'compound', 'Agarra la barra ancha, jala hacia el pecho apretando los dorsales.'),
('ex-014', 'Dumbbell Row', 'Remo con mancuerna', 'back', ARRAY['biceps'], 'dumbbell', 'compound', 'Una rodilla en banco, jala la mancuerna hacia la cadera.'),
('ex-015', 'Seated Cable Row', 'Remo sentado con cable', 'back', ARRAY['biceps'], 'cable', 'compound', 'Sentado, jala el agarre hacia el abdomen manteniendo espalda recta.'),
('ex-016', 'T-Bar Row', 'Remo en T', 'back', ARRAY['biceps','core'], 'barbell', 'compound', 'Usa landmine, inclínate y jala hacia el pecho.'),
('ex-017', 'Machine Row', 'Remo en máquina', 'back', ARRAY['biceps'], 'machine', 'compound', 'Pecho contra el pad, jala las manijas hacia ti.'),
('ex-018', 'Face Pull', 'Face pull', 'back', ARRAY['shoulders'], 'cable', 'isolation', 'Cable a altura de cara, jala la cuerda hacia la frente con codos altos.'),

-- SHOULDERS (9)
('ex-020', 'Overhead Press', 'Press militar', 'shoulders', ARRAY['triceps','core'], 'barbell', 'compound', 'De pie, empuja la barra sobre la cabeza con el core apretado.'),
('ex-021', 'Dumbbell Shoulder Press', 'Press de hombro con mancuernas', 'shoulders', ARRAY['triceps'], 'dumbbell', 'compound', 'Sentado o de pie, empuja las mancuernas sobre la cabeza.'),
('ex-022', 'Lateral Raise', 'Elevación lateral', 'shoulders', ARRAY[]::text[], 'dumbbell', 'isolation', 'Sube las mancuernas a los lados hasta la altura de los hombros.'),
('ex-023', 'Front Raise', 'Elevación frontal', 'shoulders', ARRAY[]::text[], 'dumbbell', 'isolation', 'Sube las mancuernas al frente hasta la altura de los hombros, alternando.'),
('ex-024', 'Reverse Fly', 'Pájaro invertido', 'shoulders', ARRAY['back'], 'dumbbell', 'isolation', 'Inclinado, abre los brazos hacia los lados apretando omóplatos.'),
('ex-025', 'Arnold Press', 'Press Arnold', 'shoulders', ARRAY['triceps'], 'dumbbell', 'compound', 'Inicia con palmas hacia ti, rota mientras empujas hacia arriba.'),
('ex-026', 'Machine Shoulder Press', 'Press de hombro en máquina', 'shoulders', ARRAY['triceps'], 'machine', 'compound', 'Sentado en la máquina, empuja las manijas hacia arriba.'),
('ex-027', 'Cable Lateral Raise', 'Elevación lateral con cable', 'shoulders', ARRAY[]::text[], 'cable', 'isolation', 'Polea baja, sube el brazo lateralmente cruzando frente al cuerpo.'),
('ex-028', 'Upright Row', 'Remo al mentón', 'shoulders', ARRAY['biceps'], 'barbell', 'compound', 'Agarre estrecho, sube la barra pegada al cuerpo hasta el mentón.'),

-- QUADRICEPS (8)
('ex-030', 'Squat', 'Sentadilla', 'quadriceps', ARRAY['glutes','hamstrings','core'], 'barbell', 'compound', 'Barra en trapecios, baja controlado hasta paralelo o más, sube empujando el suelo.'),
('ex-031', 'Front Squat', 'Sentadilla frontal', 'quadriceps', ARRAY['glutes','core'], 'barbell', 'compound', 'Barra en deltoides frontales, baja manteniendo torso erguido.'),
('ex-032', 'Leg Press', 'Prensa de pierna', 'quadriceps', ARRAY['glutes'], 'machine', 'compound', 'Pies a la anchura de hombros en la plataforma, baja y empuja sin bloquear rodillas.'),
('ex-033', 'Leg Extension', 'Extensión de pierna', 'quadriceps', ARRAY[]::text[], 'machine', 'isolation', 'Sentado, extiende las piernas apretando los cuádriceps arriba.'),
('ex-034', 'Bulgarian Split Squat', 'Sentadilla búlgara', 'quadriceps', ARRAY['glutes','hamstrings'], 'dumbbell', 'compound', 'Pie trasero en banco, baja la rodilla trasera hacia el suelo.'),
('ex-035', 'Goblet Squat', 'Sentadilla goblet', 'quadriceps', ARRAY['glutes','core'], 'dumbbell', 'compound', 'Sostén mancuerna/kettlebell al pecho, baja en sentadilla profunda.'),
('ex-036', 'Walking Lunge', 'Zancada caminando', 'quadriceps', ARRAY['glutes','hamstrings'], 'dumbbell', 'compound', 'Da un paso largo al frente, baja la rodilla trasera y alterna.'),
('ex-037', 'Hack Squat', 'Hack squat', 'quadriceps', ARRAY['glutes'], 'machine', 'compound', 'Espalda contra el pad de la máquina, baja y empuja.'),

-- HAMSTRINGS (5)
('ex-040', 'Romanian Deadlift', 'Peso muerto rumano', 'hamstrings', ARRAY['glutes','back'], 'barbell', 'compound', 'Piernas casi rectas, baja la barra por las piernas sintiendo el estiramiento en isquios.'),
('ex-041', 'Leg Curl', 'Curl de pierna', 'hamstrings', ARRAY[]::text[], 'machine', 'isolation', 'Boca abajo, flexiona las piernas llevando los talones hacia los glúteos.'),
('ex-042', 'Dumbbell RDL', 'Peso muerto rumano con mancuernas', 'hamstrings', ARRAY['glutes'], 'dumbbell', 'compound', 'Igual que RDL con barra pero usando mancuernas.'),
('ex-043', 'Nordic Curl', 'Curl nórdico', 'hamstrings', ARRAY[]::text[], 'bodyweight', 'isolation', 'Rodillas en el suelo, baja el torso controladamente usando los isquios.'),
('ex-044', 'Good Morning', 'Buenos días', 'hamstrings', ARRAY['back','glutes'], 'barbell', 'compound', 'Barra en trapecios, inclínate hacia adelante con piernas ligeramente flexionadas.'),

-- GLUTES (4)
('ex-050', 'Hip Thrust', 'Hip thrust', 'glutes', ARRAY['hamstrings'], 'barbell', 'compound', 'Espalda alta en banco, barra sobre la cadera, empuja hacia arriba apretando glúteos.'),
('ex-051', 'Glute Bridge', 'Puente de glúteos', 'glutes', ARRAY['hamstrings'], 'bodyweight', 'isolation', 'Acostado, pies en el suelo, sube la cadera apretando glúteos.'),
('ex-052', 'Cable Kickback', 'Patada de glúteo con cable', 'glutes', ARRAY[]::text[], 'cable', 'isolation', 'Polea baja, extiende la pierna hacia atrás apretando glúteo.'),
('ex-053', 'Sumo Deadlift', 'Peso muerto sumo', 'glutes', ARRAY['quadriceps','hamstrings','back'], 'barbell', 'compound', 'Piernas muy abiertas, pies hacia afuera, agarra la barra entre las piernas y levanta.'),

-- BICEPS (7)
('ex-060', 'Barbell Curl', 'Curl con barra', 'biceps', ARRAY['forearms'], 'barbell', 'isolation', 'De pie, flexiona los codos subiendo la barra sin mover los codos.'),
('ex-061', 'Dumbbell Curl', 'Curl con mancuernas', 'biceps', ARRAY['forearms'], 'dumbbell', 'isolation', 'Alterna o simultáneo, sube las mancuernas rotando la muñeca.'),
('ex-062', 'Hammer Curl', 'Curl martillo', 'biceps', ARRAY['forearms'], 'dumbbell', 'isolation', 'Agarre neutro (palmas hacia adentro), flexiona alternando.'),
('ex-063', 'Preacher Curl', 'Curl predicador', 'biceps', ARRAY[]::text[], 'barbell', 'isolation', 'Brazos sobre el pad, flexiona subiendo la barra EZ.'),
('ex-064', 'Cable Curl', 'Curl con cable', 'biceps', ARRAY[]::text[], 'cable', 'isolation', 'Polea baja, flexiona los codos manteniendo tensión constante.'),
('ex-065', 'Concentration Curl', 'Curl concentrado', 'biceps', ARRAY[]::text[], 'dumbbell', 'isolation', 'Sentado, codo en la rodilla, sube la mancuerna apretando el bíceps.'),
('ex-066', 'Chin-Up', 'Dominadas supinas', 'biceps', ARRAY['back'], 'bodyweight', 'compound', 'Agarre supino, jala el cuerpo arriba enfocando en bíceps.'),

-- TRICEPS (7)
('ex-070', 'Tricep Pushdown', 'Empuje de tríceps', 'triceps', ARRAY[]::text[], 'cable', 'isolation', 'Polea alta, empuja la barra/cuerda hacia abajo extendiendo los codos.'),
('ex-071', 'Overhead Tricep Extension', 'Extensión de tríceps sobre la cabeza', 'triceps', ARRAY[]::text[], 'dumbbell', 'isolation', 'Mancuerna detrás de la cabeza, extiende los brazos hacia arriba.'),
('ex-072', 'Close Grip Bench Press', 'Press de banca agarre cerrado', 'triceps', ARRAY['chest'], 'barbell', 'compound', 'Manos juntas en la barra, baja y empuja enfocando en tríceps.'),
('ex-073', 'Dips', 'Fondos en paralelas', 'triceps', ARRAY['chest','shoulders'], 'bodyweight', 'compound', 'Brazos rectos, baja flexionando codos y empuja arriba.'),
('ex-074', 'Skull Crusher', 'Rompecráneos', 'triceps', ARRAY[]::text[], 'barbell', 'isolation', 'Acostado, baja la barra EZ hacia la frente y extiende.'),
('ex-075', 'Kickback', 'Patada de tríceps', 'triceps', ARRAY[]::text[], 'dumbbell', 'isolation', 'Inclinado, extiende el brazo hacia atrás apretando el tríceps.'),
('ex-076', 'Diamond Push-Up', 'Flexiones diamante', 'triceps', ARRAY['chest'], 'bodyweight', 'compound', 'Manos juntas formando diamante, flexiona y empuja.'),

-- CORE (7)
('ex-080', 'Plank', 'Plancha', 'core', ARRAY['shoulders'], 'bodyweight', 'isolation', 'Antebrazos y puntas de pies, mantén el cuerpo recto.'),
('ex-081', 'Hanging Leg Raise', 'Elevación de piernas colgado', 'core', ARRAY['forearms'], 'bodyweight', 'isolation', 'Colgado de barra, sube las piernas rectas hasta 90°.'),
('ex-082', 'Cable Crunch', 'Crunch con cable', 'core', ARRAY[]::text[], 'cable', 'isolation', 'Rodillas en el suelo, polea alta, flexiona el torso hacia abajo.'),
('ex-083', 'Ab Wheel Rollout', 'Rueda abdominal', 'core', ARRAY['shoulders'], 'bodyweight', 'isolation', 'Rodillas en el suelo, rueda hacia adelante y regresa controlado.'),
('ex-084', 'Russian Twist', 'Giro ruso', 'core', ARRAY[]::text[], 'bodyweight', 'isolation', 'Sentado, piernas elevadas, rota el torso de lado a lado.'),
('ex-085', 'Dead Bug', 'Dead bug', 'core', ARRAY[]::text[], 'bodyweight', 'isolation', 'Boca arriba, extiende brazo y pierna opuestos alternando.'),
('ex-086', 'Mountain Climber', 'Escaladores', 'core', ARRAY['shoulders','quadriceps'], 'bodyweight', 'compound', 'Posición de plancha, lleva rodillas al pecho alternando rápido.'),

-- CALVES (3)
('ex-090', 'Standing Calf Raise', 'Elevación de talones de pie', 'calves', ARRAY[]::text[], 'machine', 'isolation', 'De pie en la máquina, sube los talones apretando pantorrillas.'),
('ex-091', 'Seated Calf Raise', 'Elevación de talones sentado', 'calves', ARRAY[]::text[], 'machine', 'isolation', 'Sentado, sube los talones enfocando en sóleo.'),
('ex-092', 'Bodyweight Calf Raise', 'Elevación de talones sin peso', 'calves', ARRAY[]::text[], 'bodyweight', 'isolation', 'En un escalón, sube y baja los talones controladamente.'),

-- FOREARMS (3)
('ex-095', 'Wrist Curl', 'Curl de muñeca', 'forearms', ARRAY[]::text[], 'barbell', 'isolation', 'Antebrazos en banco, flexiona las muñecas subiendo la barra.'),
('ex-096', 'Reverse Wrist Curl', 'Curl de muñeca invertido', 'forearms', ARRAY[]::text[], 'barbell', 'isolation', 'Agarre prono, extiende las muñecas subiendo la barra.'),
('ex-097', 'Farmer Walk', 'Caminata del granjero', 'forearms', ARRAY['core','shoulders'], 'dumbbell', 'compound', 'Agarra mancuernas pesadas y camina recto con postura firme.'),

-- FULL BODY / FUNCTIONAL (10)
('ex-100', 'Clean and Press', 'Cargada y press', 'full_body', ARRAY['shoulders','quadriceps','back'], 'barbell', 'compound', 'Levanta la barra del suelo a los hombros y empuja sobre la cabeza.'),
('ex-101', 'Kettlebell Swing', 'Swing con kettlebell', 'full_body', ARRAY['glutes','hamstrings','core'], 'kettlebell', 'compound', 'Bisagra de cadera, balancea la kettlebell entre las piernas y empuja con la cadera.'),
('ex-102', 'Thruster', 'Thruster', 'full_body', ARRAY['quadriceps','shoulders','core'], 'barbell', 'compound', 'Sentadilla frontal + press militar en un movimiento fluido.'),
('ex-103', 'Burpee', 'Burpee', 'full_body', ARRAY['chest','quadriceps','core'], 'bodyweight', 'compound', 'Agáchate, salta a plancha, flexión, salta de regreso y salta arriba.'),
('ex-104', 'Turkish Get-Up', 'Levantamiento turco', 'full_body', ARRAY['shoulders','core','glutes'], 'kettlebell', 'compound', 'Acostado, sube a posición de pie con kettlebell en brazo extendido.'),
('ex-105', 'Box Jump', 'Salto al cajón', 'full_body', ARRAY['quadriceps','calves','glutes'], 'bodyweight', 'compound', 'Desde parado, salta a un cajón aterrizando con ambos pies.'),
('ex-106', 'Battle Ropes', 'Cuerdas de batalla', 'full_body', ARRAY['shoulders','core'], 'bodyweight', 'compound', 'Agarra las cuerdas y haz olas alternando brazos rápidamente.'),
('ex-107', 'Sled Push', 'Empuje de trineo', 'full_body', ARRAY['quadriceps','glutes','core'], 'bodyweight', 'compound', 'Empuja el trineo con brazos extendidos caminando rápido.'),
('ex-108', 'Man Maker', 'Man maker', 'full_body', ARRAY['chest','back','shoulders'], 'dumbbell', 'compound', 'Flexión con remo, squat clean y press en un solo movimiento.'),
('ex-109', 'Bear Crawl', 'Gateo de oso', 'full_body', ARRAY['core','shoulders'], 'bodyweight', 'compound', 'A cuatro puntos con rodillas elevadas, avanza moviendo mano y pie opuestos.')

ON CONFLICT (id) DO NOTHING;
