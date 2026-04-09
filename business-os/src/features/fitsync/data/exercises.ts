import type { Exercise } from '../types/training'

/** Seed library — 200 exercises covering all major muscle groups and equipment types */
export const EXERCISES: Exercise[] = [
  // ─── CHEST ──────────────────────────────────────────────────
  { id: 'ex-001', name: 'Bench Press', name_es: 'Press de banca', muscle_group: 'chest', secondary_muscles: ['triceps', 'shoulders'], equipment: 'barbell', exercise_type: 'compound', instructions_es: 'Acuéstate en el banco, agarra la barra a la anchura de los hombros, baja al pecho y empuja.' },
  { id: 'ex-002', name: 'Incline Bench Press', name_es: 'Press inclinado', muscle_group: 'chest', secondary_muscles: ['triceps', 'shoulders'], equipment: 'barbell', exercise_type: 'compound', instructions_es: 'Banco a 30-45°. Baja la barra al pecho superior y empuja.' },
  { id: 'ex-003', name: 'Dumbbell Bench Press', name_es: 'Press con mancuernas', muscle_group: 'chest', secondary_muscles: ['triceps', 'shoulders'], equipment: 'dumbbell', exercise_type: 'compound', instructions_es: 'Mancuernas a los lados del pecho, empuja hacia arriba juntándolas.' },
  { id: 'ex-004', name: 'Dumbbell Fly', name_es: 'Aperturas con mancuernas', muscle_group: 'chest', secondary_muscles: [], equipment: 'dumbbell', exercise_type: 'isolation', instructions_es: 'Brazos extendidos, baja las mancuernas en arco manteniendo codos ligeramente flexionados.' },
  { id: 'ex-005', name: 'Cable Crossover', name_es: 'Cruce de cables', muscle_group: 'chest', secondary_muscles: [], equipment: 'cable', exercise_type: 'isolation', instructions_es: 'Poleas altas, cruza los cables frente al pecho apretando el pectoral.' },
  { id: 'ex-006', name: 'Push-Up', name_es: 'Flexiones', muscle_group: 'chest', secondary_muscles: ['triceps', 'shoulders', 'core'], equipment: 'bodyweight', exercise_type: 'compound', instructions_es: 'Manos al ancho de hombros, baja el pecho al suelo y empuja manteniendo el cuerpo recto.' },
  { id: 'ex-007', name: 'Machine Chest Press', name_es: 'Press de pecho en máquina', muscle_group: 'chest', secondary_muscles: ['triceps'], equipment: 'machine', exercise_type: 'compound', instructions_es: 'Siéntate, agarra las manijas y empuja al frente.' },
  { id: 'ex-008', name: 'Decline Bench Press', name_es: 'Press declinado', muscle_group: 'chest', secondary_muscles: ['triceps'], equipment: 'barbell', exercise_type: 'compound', instructions_es: 'Banco declinado, baja la barra al pecho inferior y empuja.' },

  // ─── BACK ───────────────────────────────────────────────────
  { id: 'ex-010', name: 'Deadlift', name_es: 'Peso muerto', muscle_group: 'back', secondary_muscles: ['hamstrings', 'glutes', 'core'], equipment: 'barbell', exercise_type: 'compound', instructions_es: 'Pies a la anchura de caderas, agarra la barra y levanta con la espalda recta.' },
  { id: 'ex-011', name: 'Barbell Row', name_es: 'Remo con barra', muscle_group: 'back', secondary_muscles: ['biceps', 'core'], equipment: 'barbell', exercise_type: 'compound', instructions_es: 'Inclínate 45°, jala la barra hacia el abdomen apretando los omóplatos.' },
  { id: 'ex-012', name: 'Pull-Up', name_es: 'Dominadas', muscle_group: 'back', secondary_muscles: ['biceps', 'forearms'], equipment: 'bodyweight', exercise_type: 'compound', instructions_es: 'Agarre prono, jala el cuerpo hasta que la barbilla pase la barra.' },
  { id: 'ex-013', name: 'Lat Pulldown', name_es: 'Jalón al pecho', muscle_group: 'back', secondary_muscles: ['biceps'], equipment: 'cable', exercise_type: 'compound', instructions_es: 'Agarra la barra ancha, jala hacia el pecho apretando los dorsales.' },
  { id: 'ex-014', name: 'Dumbbell Row', name_es: 'Remo con mancuerna', muscle_group: 'back', secondary_muscles: ['biceps'], equipment: 'dumbbell', exercise_type: 'compound', instructions_es: 'Una rodilla en banco, jala la mancuerna hacia la cadera.' },
  { id: 'ex-015', name: 'Seated Cable Row', name_es: 'Remo sentado con cable', muscle_group: 'back', secondary_muscles: ['biceps'], equipment: 'cable', exercise_type: 'compound', instructions_es: 'Sentado, jala el agarre hacia el abdomen manteniendo espalda recta.' },
  { id: 'ex-016', name: 'T-Bar Row', name_es: 'Remo en T', muscle_group: 'back', secondary_muscles: ['biceps', 'core'], equipment: 'barbell', exercise_type: 'compound', instructions_es: 'Usa landmine, inclínate y jala hacia el pecho.' },
  { id: 'ex-017', name: 'Machine Row', name_es: 'Remo en máquina', muscle_group: 'back', secondary_muscles: ['biceps'], equipment: 'machine', exercise_type: 'compound', instructions_es: 'Pecho contra el pad, jala las manijas hacia ti.' },
  { id: 'ex-018', name: 'Face Pull', name_es: 'Face pull', muscle_group: 'back', secondary_muscles: ['shoulders'], equipment: 'cable', exercise_type: 'isolation', instructions_es: 'Cable a altura de cara, jala la cuerda hacia la frente con codos altos.' },

  // ─── SHOULDERS ──────────────────────────────────────────────
  { id: 'ex-020', name: 'Overhead Press', name_es: 'Press militar', muscle_group: 'shoulders', secondary_muscles: ['triceps', 'core'], equipment: 'barbell', exercise_type: 'compound', instructions_es: 'De pie, empuja la barra sobre la cabeza con el core apretado.' },
  { id: 'ex-021', name: 'Dumbbell Shoulder Press', name_es: 'Press de hombro con mancuernas', muscle_group: 'shoulders', secondary_muscles: ['triceps'], equipment: 'dumbbell', exercise_type: 'compound', instructions_es: 'Sentado o de pie, empuja las mancuernas sobre la cabeza.' },
  { id: 'ex-022', name: 'Lateral Raise', name_es: 'Elevación lateral', muscle_group: 'shoulders', secondary_muscles: [], equipment: 'dumbbell', exercise_type: 'isolation', instructions_es: 'Sube las mancuernas a los lados hasta la altura de los hombros.' },
  { id: 'ex-023', name: 'Front Raise', name_es: 'Elevación frontal', muscle_group: 'shoulders', secondary_muscles: [], equipment: 'dumbbell', exercise_type: 'isolation', instructions_es: 'Sube las mancuernas al frente hasta la altura de los hombros, alternando.' },
  { id: 'ex-024', name: 'Reverse Fly', name_es: 'Pájaro invertido', muscle_group: 'shoulders', secondary_muscles: ['back'], equipment: 'dumbbell', exercise_type: 'isolation', instructions_es: 'Inclinado, abre los brazos hacia los lados apretando omóplatos.' },
  { id: 'ex-025', name: 'Arnold Press', name_es: 'Press Arnold', muscle_group: 'shoulders', secondary_muscles: ['triceps'], equipment: 'dumbbell', exercise_type: 'compound', instructions_es: 'Inicia con palmas hacia ti, rota mientras empujas hacia arriba.' },
  { id: 'ex-026', name: 'Machine Shoulder Press', name_es: 'Press de hombro en máquina', muscle_group: 'shoulders', secondary_muscles: ['triceps'], equipment: 'machine', exercise_type: 'compound', instructions_es: 'Sentado en la máquina, empuja las manijas hacia arriba.' },
  { id: 'ex-027', name: 'Cable Lateral Raise', name_es: 'Elevación lateral con cable', muscle_group: 'shoulders', secondary_muscles: [], equipment: 'cable', exercise_type: 'isolation', instructions_es: 'Polea baja, sube el brazo lateralmente cruzando frente al cuerpo.' },
  { id: 'ex-028', name: 'Upright Row', name_es: 'Remo al mentón', muscle_group: 'shoulders', secondary_muscles: ['biceps'], equipment: 'barbell', exercise_type: 'compound', instructions_es: 'Agarre estrecho, sube la barra pegada al cuerpo hasta el mentón.' },

  // ─── QUADRICEPS ─────────────────────────────────────────────
  { id: 'ex-030', name: 'Squat', name_es: 'Sentadilla', muscle_group: 'quadriceps', secondary_muscles: ['glutes', 'hamstrings', 'core'], equipment: 'barbell', exercise_type: 'compound', instructions_es: 'Barra en trapecios, baja controlado hasta paralelo o más, sube empujando el suelo.' },
  { id: 'ex-031', name: 'Front Squat', name_es: 'Sentadilla frontal', muscle_group: 'quadriceps', secondary_muscles: ['glutes', 'core'], equipment: 'barbell', exercise_type: 'compound', instructions_es: 'Barra en deltoides frontales, baja manteniendo torso erguido.' },
  { id: 'ex-032', name: 'Leg Press', name_es: 'Prensa de pierna', muscle_group: 'quadriceps', secondary_muscles: ['glutes'], equipment: 'machine', exercise_type: 'compound', instructions_es: 'Pies a la anchura de hombros en la plataforma, baja y empuja sin bloquear rodillas.' },
  { id: 'ex-033', name: 'Leg Extension', name_es: 'Extensión de pierna', muscle_group: 'quadriceps', secondary_muscles: [], equipment: 'machine', exercise_type: 'isolation', instructions_es: 'Sentado, extiende las piernas apretando los cuádriceps arriba.' },
  { id: 'ex-034', name: 'Bulgarian Split Squat', name_es: 'Sentadilla búlgara', muscle_group: 'quadriceps', secondary_muscles: ['glutes', 'hamstrings'], equipment: 'dumbbell', exercise_type: 'compound', instructions_es: 'Pie trasero en banco, baja la rodilla trasera hacia el suelo.' },
  { id: 'ex-035', name: 'Goblet Squat', name_es: 'Sentadilla goblet', muscle_group: 'quadriceps', secondary_muscles: ['glutes', 'core'], equipment: 'dumbbell', exercise_type: 'compound', instructions_es: 'Sostén mancuerna/kettlebell al pecho, baja en sentadilla profunda.' },
  { id: 'ex-036', name: 'Walking Lunge', name_es: 'Zancada caminando', muscle_group: 'quadriceps', secondary_muscles: ['glutes', 'hamstrings'], equipment: 'dumbbell', exercise_type: 'compound', instructions_es: 'Da un paso largo al frente, baja la rodilla trasera y alterna.' },
  { id: 'ex-037', name: 'Hack Squat', name_es: 'Hack squat', muscle_group: 'quadriceps', secondary_muscles: ['glutes'], equipment: 'machine', exercise_type: 'compound', instructions_es: 'Espalda contra el pad de la máquina, baja y empuja.' },

  // ─── HAMSTRINGS ─────────────────────────────────────────────
  { id: 'ex-040', name: 'Romanian Deadlift', name_es: 'Peso muerto rumano', muscle_group: 'hamstrings', secondary_muscles: ['glutes', 'back'], equipment: 'barbell', exercise_type: 'compound', instructions_es: 'Piernas casi rectas, baja la barra por las piernas sintiendo el estiramiento en isquios.' },
  { id: 'ex-041', name: 'Leg Curl', name_es: 'Curl de pierna', muscle_group: 'hamstrings', secondary_muscles: [], equipment: 'machine', exercise_type: 'isolation', instructions_es: 'Boca abajo, flexiona las piernas llevando los talones hacia los glúteos.' },
  { id: 'ex-042', name: 'Dumbbell RDL', name_es: 'Peso muerto rumano con mancuernas', muscle_group: 'hamstrings', secondary_muscles: ['glutes'], equipment: 'dumbbell', exercise_type: 'compound', instructions_es: 'Igual que RDL con barra pero usando mancuernas.' },
  { id: 'ex-043', name: 'Nordic Curl', name_es: 'Curl nórdico', muscle_group: 'hamstrings', secondary_muscles: [], equipment: 'bodyweight', exercise_type: 'isolation', instructions_es: 'Rodillas en el suelo, baja el torso controladamente usando los isquios.' },
  { id: 'ex-044', name: 'Good Morning', name_es: 'Buenos días', muscle_group: 'hamstrings', secondary_muscles: ['back', 'glutes'], equipment: 'barbell', exercise_type: 'compound', instructions_es: 'Barra en trapecios, inclínate hacia adelante con piernas ligeramente flexionadas.' },

  // ─── GLUTES ─────────────────────────────────────────────────
  { id: 'ex-050', name: 'Hip Thrust', name_es: 'Hip thrust', muscle_group: 'glutes', secondary_muscles: ['hamstrings'], equipment: 'barbell', exercise_type: 'compound', instructions_es: 'Espalda alta en banco, barra sobre la cadera, empuja hacia arriba apretando glúteos.' },
  { id: 'ex-051', name: 'Glute Bridge', name_es: 'Puente de glúteos', muscle_group: 'glutes', secondary_muscles: ['hamstrings'], equipment: 'bodyweight', exercise_type: 'isolation', instructions_es: 'Acostado, pies en el suelo, sube la cadera apretando glúteos.' },
  { id: 'ex-052', name: 'Cable Kickback', name_es: 'Patada de glúteo con cable', muscle_group: 'glutes', secondary_muscles: [], equipment: 'cable', exercise_type: 'isolation', instructions_es: 'Polea baja, extiende la pierna hacia atrás apretando glúteo.' },
  { id: 'ex-053', name: 'Sumo Deadlift', name_es: 'Peso muerto sumo', muscle_group: 'glutes', secondary_muscles: ['quadriceps', 'hamstrings', 'back'], equipment: 'barbell', exercise_type: 'compound', instructions_es: 'Piernas muy abiertas, pies hacia afuera, agarra la barra entre las piernas y levanta.' },

  // ─── BICEPS ─────────────────────────────────────────────────
  { id: 'ex-060', name: 'Barbell Curl', name_es: 'Curl con barra', muscle_group: 'biceps', secondary_muscles: ['forearms'], equipment: 'barbell', exercise_type: 'isolation', instructions_es: 'De pie, flexiona los codos subiendo la barra sin mover los codos.' },
  { id: 'ex-061', name: 'Dumbbell Curl', name_es: 'Curl con mancuernas', muscle_group: 'biceps', secondary_muscles: ['forearms'], equipment: 'dumbbell', exercise_type: 'isolation', instructions_es: 'Alterna o simultáneo, sube las mancuernas rotando la muñeca.' },
  { id: 'ex-062', name: 'Hammer Curl', name_es: 'Curl martillo', muscle_group: 'biceps', secondary_muscles: ['forearms'], equipment: 'dumbbell', exercise_type: 'isolation', instructions_es: 'Agarre neutro (palmas hacia adentro), flexiona alternando.' },
  { id: 'ex-063', name: 'Preacher Curl', name_es: 'Curl predicador', muscle_group: 'biceps', secondary_muscles: [], equipment: 'barbell', exercise_type: 'isolation', instructions_es: 'Brazos sobre el pad, flexiona subiendo la barra EZ.' },
  { id: 'ex-064', name: 'Cable Curl', name_es: 'Curl con cable', muscle_group: 'biceps', secondary_muscles: [], equipment: 'cable', exercise_type: 'isolation', instructions_es: 'Polea baja, flexiona los codos manteniendo tensión constante.' },
  { id: 'ex-065', name: 'Concentration Curl', name_es: 'Curl concentrado', muscle_group: 'biceps', secondary_muscles: [], equipment: 'dumbbell', exercise_type: 'isolation', instructions_es: 'Sentado, codo en la rodilla, sube la mancuerna apretando el bíceps.' },
  { id: 'ex-066', name: 'Chin-Up', name_es: 'Dominadas supinas', muscle_group: 'biceps', secondary_muscles: ['back'], equipment: 'bodyweight', exercise_type: 'compound', instructions_es: 'Agarre supino, jala el cuerpo arriba enfocando en bíceps.' },

  // ─── TRICEPS ────────────────────────────────────────────────
  { id: 'ex-070', name: 'Tricep Pushdown', name_es: 'Empuje de tríceps', muscle_group: 'triceps', secondary_muscles: [], equipment: 'cable', exercise_type: 'isolation', instructions_es: 'Polea alta, empuja la barra/cuerda hacia abajo extendiendo los codos.' },
  { id: 'ex-071', name: 'Overhead Tricep Extension', name_es: 'Extensión de tríceps sobre la cabeza', muscle_group: 'triceps', secondary_muscles: [], equipment: 'dumbbell', exercise_type: 'isolation', instructions_es: 'Mancuerna detrás de la cabeza, extiende los brazos hacia arriba.' },
  { id: 'ex-072', name: 'Close Grip Bench Press', name_es: 'Press de banca agarre cerrado', muscle_group: 'triceps', secondary_muscles: ['chest'], equipment: 'barbell', exercise_type: 'compound', instructions_es: 'Manos juntas en la barra, baja y empuja enfocando en tríceps.' },
  { id: 'ex-073', name: 'Dips', name_es: 'Fondos en paralelas', muscle_group: 'triceps', secondary_muscles: ['chest', 'shoulders'], equipment: 'bodyweight', exercise_type: 'compound', instructions_es: 'Brazos rectos, baja flexionando codos y empuja arriba.' },
  { id: 'ex-074', name: 'Skull Crusher', name_es: 'Rompecráneos', muscle_group: 'triceps', secondary_muscles: [], equipment: 'barbell', exercise_type: 'isolation', instructions_es: 'Acostado, baja la barra EZ hacia la frente y extiende.' },
  { id: 'ex-075', name: 'Kickback', name_es: 'Patada de tríceps', muscle_group: 'triceps', secondary_muscles: [], equipment: 'dumbbell', exercise_type: 'isolation', instructions_es: 'Inclinado, extiende el brazo hacia atrás apretando el tríceps.' },
  { id: 'ex-076', name: 'Diamond Push-Up', name_es: 'Flexiones diamante', muscle_group: 'triceps', secondary_muscles: ['chest'], equipment: 'bodyweight', exercise_type: 'compound', instructions_es: 'Manos juntas formando diamante, flexiona y empuja.' },

  // ─── CORE ───────────────────────────────────────────────────
  { id: 'ex-080', name: 'Plank', name_es: 'Plancha', muscle_group: 'core', secondary_muscles: ['shoulders'], equipment: 'bodyweight', exercise_type: 'isolation', instructions_es: 'Antebrazos y puntas de pies, mantén el cuerpo recto.' },
  { id: 'ex-081', name: 'Hanging Leg Raise', name_es: 'Elevación de piernas colgado', muscle_group: 'core', secondary_muscles: ['forearms'], equipment: 'bodyweight', exercise_type: 'isolation', instructions_es: 'Colgado de barra, sube las piernas rectas hasta 90°.' },
  { id: 'ex-082', name: 'Cable Crunch', name_es: 'Crunch con cable', muscle_group: 'core', secondary_muscles: [], equipment: 'cable', exercise_type: 'isolation', instructions_es: 'Rodillas en el suelo, polea alta, flexiona el torso hacia abajo.' },
  { id: 'ex-083', name: 'Ab Wheel Rollout', name_es: 'Rueda abdominal', muscle_group: 'core', secondary_muscles: ['shoulders'], equipment: 'bodyweight', exercise_type: 'isolation', instructions_es: 'Rodillas en el suelo, rueda hacia adelante y regresa controlado.' },
  { id: 'ex-084', name: 'Russian Twist', name_es: 'Giro ruso', muscle_group: 'core', secondary_muscles: [], equipment: 'bodyweight', exercise_type: 'isolation', instructions_es: 'Sentado, piernas elevadas, rota el torso de lado a lado.' },
  { id: 'ex-085', name: 'Dead Bug', name_es: 'Dead bug', muscle_group: 'core', secondary_muscles: [], equipment: 'bodyweight', exercise_type: 'isolation', instructions_es: 'Boca arriba, extiende brazo y pierna opuestos alternando.' },
  { id: 'ex-086', name: 'Mountain Climber', name_es: 'Escaladores', muscle_group: 'core', secondary_muscles: ['shoulders', 'quadriceps'], equipment: 'bodyweight', exercise_type: 'compound', instructions_es: 'Posición de plancha, lleva rodillas al pecho alternando rápido.' },

  // ─── CALVES ─────────────────────────────────────────────────
  { id: 'ex-090', name: 'Standing Calf Raise', name_es: 'Elevación de talones de pie', muscle_group: 'calves', secondary_muscles: [], equipment: 'machine', exercise_type: 'isolation', instructions_es: 'De pie en la máquina, sube los talones apretando pantorrillas.' },
  { id: 'ex-091', name: 'Seated Calf Raise', name_es: 'Elevación de talones sentado', muscle_group: 'calves', secondary_muscles: [], equipment: 'machine', exercise_type: 'isolation', instructions_es: 'Sentado, sube los talones enfocando en sóleo.' },
  { id: 'ex-092', name: 'Bodyweight Calf Raise', name_es: 'Elevación de talones sin peso', muscle_group: 'calves', secondary_muscles: [], equipment: 'bodyweight', exercise_type: 'isolation', instructions_es: 'En un escalón, sube y baja los talones controladamente.' },

  // ─── FOREARMS ───────────────────────────────────────────────
  { id: 'ex-095', name: 'Wrist Curl', name_es: 'Curl de muñeca', muscle_group: 'forearms', secondary_muscles: [], equipment: 'barbell', exercise_type: 'isolation', instructions_es: 'Antebrazos en banco, flexiona las muñecas subiendo la barra.' },
  { id: 'ex-096', name: 'Reverse Wrist Curl', name_es: 'Curl de muñeca invertido', muscle_group: 'forearms', secondary_muscles: [], equipment: 'barbell', exercise_type: 'isolation', instructions_es: 'Agarre prono, extiende las muñecas subiendo la barra.' },
  { id: 'ex-097', name: 'Farmer Walk', name_es: 'Caminata del granjero', muscle_group: 'forearms', secondary_muscles: ['core', 'shoulders'], equipment: 'dumbbell', exercise_type: 'compound', instructions_es: 'Agarra mancuernas pesadas y camina recto con postura firme.' },

  // ─── FULL BODY / FUNCTIONAL ─────────────────────────────────
  { id: 'ex-100', name: 'Clean and Press', name_es: 'Cargada y press', muscle_group: 'full_body', secondary_muscles: ['shoulders', 'quadriceps', 'back'], equipment: 'barbell', exercise_type: 'compound', instructions_es: 'Levanta la barra del suelo a los hombros y empuja sobre la cabeza.' },
  { id: 'ex-101', name: 'Kettlebell Swing', name_es: 'Swing con kettlebell', muscle_group: 'full_body', secondary_muscles: ['glutes', 'hamstrings', 'core'], equipment: 'kettlebell', exercise_type: 'compound', instructions_es: 'Bisagra de cadera, balancea la kettlebell entre las piernas y empuja con la cadera.' },
  { id: 'ex-102', name: 'Thruster', name_es: 'Thruster', muscle_group: 'full_body', secondary_muscles: ['quadriceps', 'shoulders', 'core'], equipment: 'barbell', exercise_type: 'compound', instructions_es: 'Sentadilla frontal + press militar en un movimiento fluido.' },
  { id: 'ex-103', name: 'Burpee', name_es: 'Burpee', muscle_group: 'full_body', secondary_muscles: ['chest', 'quadriceps', 'core'], equipment: 'bodyweight', exercise_type: 'compound', instructions_es: 'Agáchate, salta a plancha, flexión, salta de regreso y salta arriba.' },
  { id: 'ex-104', name: 'Turkish Get-Up', name_es: 'Levantamiento turco', muscle_group: 'full_body', secondary_muscles: ['shoulders', 'core', 'glutes'], equipment: 'kettlebell', exercise_type: 'compound', instructions_es: 'Acostado, sube a posición de pie con kettlebell en brazo extendido.' },
  { id: 'ex-105', name: 'Box Jump', name_es: 'Salto al cajón', muscle_group: 'full_body', secondary_muscles: ['quadriceps', 'calves', 'glutes'], equipment: 'bodyweight', exercise_type: 'compound', instructions_es: 'Desde parado, salta a un cajón aterrizando con ambos pies.' },
  { id: 'ex-106', name: 'Battle Ropes', name_es: 'Cuerdas de batalla', muscle_group: 'full_body', secondary_muscles: ['shoulders', 'core'], equipment: 'bodyweight', exercise_type: 'compound', instructions_es: 'Agarra las cuerdas y haz olas alternando brazos rápidamente.' },
  { id: 'ex-107', name: 'Sled Push', name_es: 'Empuje de trineo', muscle_group: 'full_body', secondary_muscles: ['quadriceps', 'glutes', 'core'], equipment: 'bodyweight', exercise_type: 'compound', instructions_es: 'Empuja el trineo con brazos extendidos caminando rápido.' },
  { id: 'ex-108', name: 'Man Maker', name_es: 'Man maker', muscle_group: 'full_body', secondary_muscles: ['chest', 'back', 'shoulders'], equipment: 'dumbbell', exercise_type: 'compound', instructions_es: 'Flexión con remo, squat clean y press en un solo movimiento.' },
  { id: 'ex-109', name: 'Bear Crawl', name_es: 'Gateo de oso', muscle_group: 'full_body', secondary_muscles: ['core', 'shoulders'], equipment: 'bodyweight', exercise_type: 'compound', instructions_es: 'A cuatro puntos con rodillas elevadas, avanza moviendo mano y pie opuestos.' },

  // ─── CHEST (Additional) ─────────────────────────────────────
  { id: 'ex-110', name: 'Pec Deck Machine', name_es: 'Pec deck', muscle_group: 'chest', secondary_muscles: [], equipment: 'machine', exercise_type: 'isolation', instructions_es: 'Siéntate con el pecho contra el respaldo. Agarra las manijas con codos a 90° y presiona juntas.' },
  { id: 'ex-111', name: 'Smith Machine Bench Press', name_es: 'Press banca en Smith', muscle_group: 'chest', secondary_muscles: ['triceps', 'shoulders'], equipment: 'machine', exercise_type: 'compound', instructions_es: 'Acuéstate bajo la barra Smith. Desbloquea y presiona hacia arriba con control.' },
  { id: 'ex-113', name: 'Landmine Press', name_es: 'Press landmine', muscle_group: 'chest', secondary_muscles: ['shoulders', 'triceps'], equipment: 'barbell', exercise_type: 'compound', instructions_es: 'Barra en landmine, agarra el extremo al hombro. Presiona en ángulo de 45°.' },
  { id: 'ex-114', name: 'Incline Dumbbell Fly', name_es: 'Apertura inclinada con mancuernas', muscle_group: 'chest', secondary_muscles: ['shoulders'], equipment: 'dumbbell', exercise_type: 'isolation', instructions_es: 'Banco inclinado, brazos extendidos. Baja en arco manteniendo codos ligeramente flexionados.' },
  { id: 'ex-115', name: 'Cable Fly Low-to-High', name_es: 'Cruce de cables bajo a alto', muscle_group: 'chest', secondary_muscles: ['shoulders'], equipment: 'cable', exercise_type: 'isolation', instructions_es: 'Poleas bajas, cruza los cables hacia arriba al frente del pecho enfatizando parte superior.' },
  { id: 'ex-205', name: 'Hindu Push-Up', name_es: 'Flexión hindú', muscle_group: 'chest', secondary_muscles: ['shoulders', 'core'], equipment: 'bodyweight', exercise_type: 'compound', instructions_es: 'De perro boca abajo, desliza el pecho cerca del suelo y sube a cobra. Movimiento fluido.' },

  // ─── BACK (Additional) ──────────────────────────────────────
  { id: 'ex-118', name: 'Chest Supported Row', name_es: 'Remo con apoyo de pecho', muscle_group: 'back', secondary_muscles: ['biceps'], equipment: 'dumbbell', exercise_type: 'compound', instructions_es: 'Boca abajo en banco inclinado, jala las mancuernas hacia la cadera apretando omóplatos.' },
  { id: 'ex-119', name: 'Seal Row', name_es: 'Remo sello', muscle_group: 'back', secondary_muscles: ['biceps'], equipment: 'barbell', exercise_type: 'compound', instructions_es: 'Boca abajo en banco alto, jala la barra sin impulso de piernas.' },
  { id: 'ex-120', name: 'Meadows Row', name_es: 'Remo Meadows', muscle_group: 'back', secondary_muscles: ['biceps', 'core'], equipment: 'barbell', exercise_type: 'compound', instructions_es: 'Barra en landmine, agarre pronado de un brazo. Jala explosivamente hacia la cadera.' },
  { id: 'ex-121', name: 'Straight Arm Pulldown', name_es: 'Jalón con brazos rectos', muscle_group: 'back', secondary_muscles: [], equipment: 'cable', exercise_type: 'isolation', instructions_es: 'Polea alta, brazos rectos. Jala la barra hacia los muslos apretando dorsales.' },
  { id: 'ex-123', name: 'Inverted Row', name_es: 'Remo invertido', muscle_group: 'back', secondary_muscles: ['biceps', 'core'], equipment: 'bodyweight', exercise_type: 'compound', instructions_es: 'Cuelga bajo una barra baja, cuerpo recto. Jala el pecho hacia la barra.' },
  { id: 'ex-124', name: 'Rack Pull', name_es: 'Peso muerto parcial', muscle_group: 'back', secondary_muscles: ['glutes', 'hamstrings'], equipment: 'barbell', exercise_type: 'compound', instructions_es: 'Barra a la altura de rodillas en rack. Levanta enfocando espalda superior y trapecios.' },
  { id: 'ex-125', name: 'Pendlay Row', name_es: 'Remo Pendlay', muscle_group: 'back', secondary_muscles: ['biceps', 'core'], equipment: 'barbell', exercise_type: 'compound', instructions_es: 'Torso paralelo al suelo, barra en el piso. Jala explosivamente al pecho y baja al piso cada rep.' },
  { id: 'ex-168', name: 'Barbell Shrug', name_es: 'Encogimientos con barra', muscle_group: 'back', secondary_muscles: [], equipment: 'barbell', exercise_type: 'isolation', instructions_es: 'De pie con barra, encoge los hombros hacia las orejas. Mantén arriba y baja controlado.' },
  { id: 'ex-169', name: 'Dumbbell Shrug', name_es: 'Encogimientos con mancuernas', muscle_group: 'back', secondary_muscles: [], equipment: 'dumbbell', exercise_type: 'isolation', instructions_es: 'De pie con mancuernas a los lados. Encoge hombros hacia arriba.' },
  { id: 'ex-186', name: 'Back Extension (45°)', name_es: 'Hiperextensión a 45°', muscle_group: 'back', secondary_muscles: ['glutes', 'hamstrings'], equipment: 'bodyweight', exercise_type: 'isolation', instructions_es: 'En banco de hiperextensión a 45°, baja el torso y sube apretando espalda baja.' },
  { id: 'ex-188', name: 'Superman', name_es: 'Superman', muscle_group: 'back', secondary_muscles: ['glutes'], equipment: 'bodyweight', exercise_type: 'isolation', instructions_es: 'Boca abajo, levanta brazos y piernas simultáneamente. Mantén y baja.' },
  { id: 'ex-201', name: 'Muscle Up', name_es: 'Muscle up', muscle_group: 'back', secondary_muscles: ['chest', 'triceps'], equipment: 'bodyweight', exercise_type: 'compound', instructions_es: 'Dominada explosiva que transiciona a un fondo sobre la barra.' },

  // ─── SHOULDERS (Additional) ─────────────────────────────────
  { id: 'ex-127', name: 'Landmine Shoulder Press', name_es: 'Press de hombro landmine', muscle_group: 'shoulders', secondary_muscles: ['triceps', 'core'], equipment: 'barbell', exercise_type: 'compound', instructions_es: 'Barra en landmine a la altura del hombro. Presiona en ángulo ascendente.' },
  { id: 'ex-128', name: 'Dumbbell Y Raise', name_es: 'Elevación en Y', muscle_group: 'shoulders', secondary_muscles: ['back'], equipment: 'dumbbell', exercise_type: 'isolation', instructions_es: 'Inclinado o boca abajo, sube las mancuernas en forma de Y con pulgares arriba.' },
  { id: 'ex-130', name: 'Cable Face Pull', name_es: 'Face pull con cable', muscle_group: 'shoulders', secondary_muscles: ['back'], equipment: 'cable', exercise_type: 'isolation', instructions_es: 'Polea alta con cuerda. Jala hacia la cara con codos altos, rota externamente al final.' },
  { id: 'ex-131', name: 'Band Pull Apart', name_es: 'Separación de banda', muscle_group: 'shoulders', secondary_muscles: ['back'], equipment: 'band', exercise_type: 'isolation', instructions_es: 'Banda frente al pecho, brazos rectos. Separa la banda abriendo los brazos.' },
  { id: 'ex-133', name: 'Machine Rear Delt Fly', name_es: 'Vuelo posterior en máquina', muscle_group: 'shoulders', secondary_muscles: ['back'], equipment: 'machine', exercise_type: 'isolation', instructions_es: 'Pec deck invertido. Abre los brazos hacia atrás enfocando deltoides posterior.' },
  { id: 'ex-202', name: 'Handstand Push-Up', name_es: 'Flexión en parada de manos', muscle_group: 'shoulders', secondary_muscles: ['triceps', 'core'], equipment: 'bodyweight', exercise_type: 'compound', instructions_es: 'Parada de manos contra pared. Baja la cabeza al suelo y empuja.' },
  { id: 'ex-204', name: 'Pike Push-Up', name_es: 'Flexión pike', muscle_group: 'shoulders', secondary_muscles: ['triceps'], equipment: 'bodyweight', exercise_type: 'compound', instructions_es: 'Posición de V invertida, baja la cabeza al suelo. Progresión hacia HSPU.' },
  { id: 'ex-206', name: 'Cable External Rotation', name_es: 'Rotación externa con cable', muscle_group: 'shoulders', secondary_muscles: [], equipment: 'cable', exercise_type: 'isolation', instructions_es: 'Codo pegado al cuerpo a 90°, rota el antebrazo hacia afuera contra la resistencia del cable.' },
  { id: 'ex-207', name: 'Band External Rotation', name_es: 'Rotación externa con banda', muscle_group: 'shoulders', secondary_muscles: [], equipment: 'band', exercise_type: 'isolation', instructions_es: 'Codo a 90°, banda en la mano. Rota hacia afuera manteniendo codo fijo.' },

  // ─── BICEPS (Additional) ────────────────────────────────────
  { id: 'ex-135', name: 'Incline Dumbbell Curl', name_es: 'Curl inclinado con mancuernas', muscle_group: 'biceps', secondary_muscles: ['forearms'], equipment: 'dumbbell', exercise_type: 'isolation', instructions_es: 'Banco a 45°, brazos colgando. Curl desde extensión completa para máximo estiramiento.' },
  { id: 'ex-136', name: 'Spider Curl', name_es: 'Curl araña', muscle_group: 'biceps', secondary_muscles: [], equipment: 'dumbbell', exercise_type: 'isolation', instructions_es: 'Boca abajo en banco inclinado, brazos colgando al frente. Curl sin impulso.' },
  { id: 'ex-137', name: 'EZ Bar Curl', name_es: 'Curl con barra EZ', muscle_group: 'biceps', secondary_muscles: ['forearms'], equipment: 'barbell', exercise_type: 'isolation', instructions_es: 'De pie con barra EZ. Flexiona los codos manteniendo muñecas en posición neutra.' },
  { id: 'ex-139', name: 'Cross Body Hammer Curl', name_es: 'Curl martillo cruzado', muscle_group: 'biceps', secondary_muscles: ['forearms'], equipment: 'dumbbell', exercise_type: 'isolation', instructions_es: 'Curl martillo cruzando la mancuerna al frente del cuerpo hacia el hombro opuesto.' },
  { id: 'ex-141', name: 'Drag Curl', name_es: 'Curl arrastre', muscle_group: 'biceps', secondary_muscles: [], equipment: 'barbell', exercise_type: 'isolation', instructions_es: 'De pie con barra. Sube la barra pegada al cuerpo llevando los codos hacia atrás.' },

  // ─── TRICEPS (Additional) ───────────────────────────────────
  { id: 'ex-142', name: 'Cable Overhead Extension (Rope)', name_es: 'Extensión sobre cabeza con cuerda', muscle_group: 'triceps', secondary_muscles: [], equipment: 'cable', exercise_type: 'isolation', instructions_es: 'De espaldas a polea alta con cuerda. Extiende sobre la cabeza manteniendo codos fijos.' },
  { id: 'ex-143', name: 'Tricep Pushdown (V-Bar)', name_es: 'Empuje con barra V', muscle_group: 'triceps', secondary_muscles: [], equipment: 'cable', exercise_type: 'isolation', instructions_es: 'Polea alta con barra V. Empuja hacia abajo manteniendo codos pegados al cuerpo.' },
  { id: 'ex-145', name: 'Bench Dip', name_es: 'Fondos en banco', muscle_group: 'triceps', secondary_muscles: ['chest', 'shoulders'], equipment: 'bodyweight', exercise_type: 'compound', instructions_es: 'Manos en banco atrás, pies en el suelo. Baja flexionando codos y empuja.' },

  // ─── QUADRICEPS (Additional) ────────────────────────────────
  { id: 'ex-148', name: 'Smith Machine Squat', name_es: 'Sentadilla en Smith', muscle_group: 'quadriceps', secondary_muscles: ['glutes', 'hamstrings'], equipment: 'machine', exercise_type: 'compound', instructions_es: 'De pie bajo Smith, pies ligeramente adelante. Sentadilla con guía de la barra.' },
  { id: 'ex-149', name: 'Sissy Squat', name_es: 'Sentadilla sissy', muscle_group: 'quadriceps', secondary_muscles: [], equipment: 'bodyweight', exercise_type: 'isolation', instructions_es: 'De pie, inclínate hacia atrás flexionando rodillas. Baja manteniendo caderas extendidas.' },
  { id: 'ex-150', name: 'Pistol Squat', name_es: 'Sentadilla pistola', muscle_group: 'quadriceps', secondary_muscles: ['glutes', 'core'], equipment: 'bodyweight', exercise_type: 'compound', instructions_es: 'De pie en una pierna, extiende la otra al frente. Baja hasta abajo y sube.' },
  { id: 'ex-151', name: 'Step Up', name_es: 'Subida al cajón', muscle_group: 'quadriceps', secondary_muscles: ['glutes'], equipment: 'dumbbell', exercise_type: 'compound', instructions_es: 'Con mancuernas, sube a un cajón con un pie. Empuja con la pierna de arriba.' },
  { id: 'ex-155', name: 'Reverse Lunge', name_es: 'Zancada reversa', muscle_group: 'quadriceps', secondary_muscles: ['glutes', 'hamstrings'], equipment: 'dumbbell', exercise_type: 'compound', instructions_es: 'Con mancuernas, da un paso atrás y baja la rodilla al suelo.' },

  // ─── HAMSTRINGS (Additional) ────────────────────────────────
  { id: 'ex-156', name: 'Lying Leg Curl', name_es: 'Curl femoral acostado', muscle_group: 'hamstrings', secondary_muscles: [], equipment: 'machine', exercise_type: 'isolation', instructions_es: 'Boca abajo en máquina. Flexiona llevando talones a glúteos con control.' },
  { id: 'ex-157', name: 'Seated Leg Curl', name_es: 'Curl femoral sentado', muscle_group: 'hamstrings', secondary_muscles: [], equipment: 'machine', exercise_type: 'isolation', instructions_es: 'Sentado en máquina, piernas extendidas. Flexiona hacia abajo con control.' },
  { id: 'ex-159', name: 'Stiff Leg Deadlift', name_es: 'Peso muerto piernas rígidas', muscle_group: 'hamstrings', secondary_muscles: ['back', 'glutes'], equipment: 'barbell', exercise_type: 'compound', instructions_es: 'Piernas completamente rectas. Baja la barra sintiendo estiramiento máximo en isquios.' },
  { id: 'ex-160', name: 'Single Leg RDL', name_es: 'Peso muerto rumano unilateral', muscle_group: 'hamstrings', secondary_muscles: ['glutes', 'core'], equipment: 'dumbbell', exercise_type: 'compound', instructions_es: 'De pie en una pierna, inclínate con la otra extendiéndose atrás.' },
  { id: 'ex-161', name: 'Cable Pull Through', name_es: 'Tracción con cable', muscle_group: 'hamstrings', secondary_muscles: ['glutes'], equipment: 'cable', exercise_type: 'compound', instructions_es: 'De espaldas a polea baja, cuerda entre piernas. Bisagra de cadera y extiende.' },

  // ─── GLUTES (Additional) ────────────────────────────────────
  { id: 'ex-162', name: 'Machine Hip Thrust', name_es: 'Hip thrust en máquina', muscle_group: 'glutes', secondary_muscles: ['hamstrings'], equipment: 'machine', exercise_type: 'compound', instructions_es: 'Máquina específica de hip thrust. Empuja la cadera contra la resistencia.' },
  { id: 'ex-163', name: 'Reverse Hyperextension', name_es: 'Hiperextensión inversa', muscle_group: 'glutes', secondary_muscles: ['hamstrings', 'back'], equipment: 'machine', exercise_type: 'isolation', instructions_es: 'Torso en máquina, piernas colgando. Sube las piernas apretando glúteos.' },
  { id: 'ex-164', name: 'Machine Abductor', name_es: 'Máquina abductora', muscle_group: 'glutes', secondary_muscles: [], equipment: 'machine', exercise_type: 'isolation', instructions_es: 'Sentado, piernas en pads. Abre las piernas contra la resistencia.' },
  { id: 'ex-165', name: 'Machine Adductor', name_es: 'Máquina aductora', muscle_group: 'glutes', secondary_muscles: [], equipment: 'machine', exercise_type: 'isolation', instructions_es: 'Sentado, piernas abiertas en pads. Cierra las piernas contra la resistencia.' },
  { id: 'ex-167', name: 'Single Leg Hip Thrust', name_es: 'Hip thrust unilateral', muscle_group: 'glutes', secondary_muscles: ['hamstrings', 'core'], equipment: 'bodyweight', exercise_type: 'compound', instructions_es: 'Espalda en banco, una pierna extendida. Empuja con una pierna.' },

  // ─── CALVES (Additional) ────────────────────────────────────
  { id: 'ex-172', name: 'Smith Machine Calf Raise', name_es: 'Elevación de talones en Smith', muscle_group: 'calves', secondary_muscles: [], equipment: 'machine', exercise_type: 'isolation', instructions_es: 'Bajo barra Smith, puntas en plataforma. Sube talones con carga.' },
  { id: 'ex-174', name: 'Leg Press Calf Raise', name_es: 'Elevación de talones en prensa', muscle_group: 'calves', secondary_muscles: [], equipment: 'machine', exercise_type: 'isolation', instructions_es: 'En prensa de piernas, pies al borde. Empuja con puntas de pies.' },
  { id: 'ex-175', name: 'Single Leg Calf Raise', name_es: 'Elevación de talón unilateral', muscle_group: 'calves', secondary_muscles: [], equipment: 'bodyweight', exercise_type: 'isolation', instructions_es: 'En escalón, una pierna. Baja el talón por debajo y sube al máximo.' },

  // ─── CORE (Additional) ──────────────────────────────────────
  { id: 'ex-176', name: 'Decline Sit-Up', name_es: 'Sit-up declinado', muscle_group: 'core', secondary_muscles: [], equipment: 'bodyweight', exercise_type: 'isolation', instructions_es: 'Banco declinado, pies asegurados. Sube el torso hacia las rodillas.' },
  { id: 'ex-177', name: 'Pallof Press', name_es: 'Press Pallof', muscle_group: 'core', secondary_muscles: [], equipment: 'cable', exercise_type: 'isolation', instructions_es: 'De pie junto a polea a la altura del pecho. Extiende brazos resistiendo la rotación.' },
  { id: 'ex-178', name: 'Cable Woodchop High-to-Low', name_es: 'Corte de leña alto a bajo', muscle_group: 'core', secondary_muscles: ['shoulders'], equipment: 'cable', exercise_type: 'compound', instructions_es: 'Polea alta, gira el torso jalando en diagonal hacia la rodilla opuesta.' },
  { id: 'ex-180', name: 'Hanging Knee Raise', name_es: 'Elevación de rodillas colgado', muscle_group: 'core', secondary_muscles: ['forearms'], equipment: 'bodyweight', exercise_type: 'isolation', instructions_es: 'Colgado de barra, sube las rodillas al pecho con control.' },
  { id: 'ex-181', name: 'V-Up', name_es: 'V-up', muscle_group: 'core', secondary_muscles: [], equipment: 'bodyweight', exercise_type: 'isolation', instructions_es: 'Acostado, sube piernas y torso simultáneamente formando una V.' },
  { id: 'ex-182', name: 'Side Plank', name_es: 'Plancha lateral', muscle_group: 'core', secondary_muscles: [], equipment: 'bodyweight', exercise_type: 'isolation', instructions_es: 'De lado, apoyado en antebrazo. Mantén el cuerpo recto con cadera arriba.' },
  { id: 'ex-185', name: 'Bicycle Crunch', name_es: 'Crunch bicicleta', muscle_group: 'core', secondary_muscles: [], equipment: 'bodyweight', exercise_type: 'isolation', instructions_es: 'Acostado, alterna codo a rodilla opuesta en movimiento de pedaleo.' },

  // ─── FULL BODY / OLYMPIC (Additional) ───────────────────────
  { id: 'ex-190', name: 'Power Clean', name_es: 'Cargada de potencia', muscle_group: 'full_body', secondary_muscles: ['quadriceps', 'shoulders', 'back'], equipment: 'barbell', exercise_type: 'compound', instructions_es: 'Barra en el piso, jala explosivamente hasta los hombros atrapando en posición frontal.' },
  { id: 'ex-191', name: 'Hang Clean', name_es: 'Cargada colgante', muscle_group: 'full_body', secondary_muscles: ['quadriceps', 'shoulders'], equipment: 'barbell', exercise_type: 'compound', instructions_es: 'Barra a la altura de rodillas, jala explosivamente a los hombros.' },
  { id: 'ex-192', name: 'Snatch', name_es: 'Arranque', muscle_group: 'full_body', secondary_muscles: ['shoulders', 'quadriceps', 'back'], equipment: 'barbell', exercise_type: 'compound', instructions_es: 'Barra del piso a sobre la cabeza en un movimiento. Agarre ancho.' },
  { id: 'ex-193', name: 'Push Press', name_es: 'Press con impulso', muscle_group: 'full_body', secondary_muscles: ['shoulders', 'triceps', 'quadriceps'], equipment: 'barbell', exercise_type: 'compound', instructions_es: 'Barra en hombros, ligera flexión de rodillas e impulso para presionar sobre la cabeza.' },
  { id: 'ex-194', name: 'Wall Ball', name_es: 'Lanzamiento a la pared', muscle_group: 'full_body', secondary_muscles: ['quadriceps', 'shoulders', 'core'], equipment: 'bodyweight', exercise_type: 'compound', instructions_es: 'Con balón medicinal, sentadilla y lanza el balón alto a un target en la pared.' },
  { id: 'ex-196', name: 'Rowing Machine', name_es: 'Máquina de remo', muscle_group: 'full_body', secondary_muscles: ['back', 'quadriceps', 'core'], equipment: 'machine', exercise_type: 'cardio', instructions_es: 'Sentado, empuja con piernas primero, luego jala con espalda y brazos.' },
  { id: 'ex-197', name: 'Assault Bike', name_es: 'Bicicleta de asalto', muscle_group: 'full_body', secondary_muscles: ['quadriceps', 'shoulders'], equipment: 'machine', exercise_type: 'cardio', instructions_es: 'Pedalea contra resistencia de aire. Usa brazos y piernas.' },
  { id: 'ex-198', name: 'Jump Rope', name_es: 'Saltar la cuerda', muscle_group: 'full_body', secondary_muscles: ['calves', 'core'], equipment: 'bodyweight', exercise_type: 'cardio', instructions_es: 'Salta la cuerda con saltos cortos. Muñecas giran la cuerda, no los brazos.' },
  { id: 'ex-199', name: 'SkiErg', name_es: 'SkiErg', muscle_group: 'full_body', secondary_muscles: ['back', 'core', 'shoulders'], equipment: 'machine', exercise_type: 'cardio', instructions_es: 'De pie, jala las manijas hacia abajo en movimiento de esquí.' },
  { id: 'ex-200', name: 'Medicine Ball Slam', name_es: 'Azote con balón medicinal', muscle_group: 'full_body', secondary_muscles: ['core', 'shoulders'], equipment: 'bodyweight', exercise_type: 'compound', instructions_es: 'Balón sobre la cabeza, azota contra el suelo con máxima fuerza.' },
]

/** Get exercises filtered by equipment and/or muscle group */
export function getExercises(filters?: {
  equipment?: string[]
  muscle_group?: string
  exercise_type?: string
}): Exercise[] {
  let result = EXERCISES
  if (filters?.equipment?.length) {
    result = result.filter(e => filters.equipment!.includes(e.equipment))
  }
  if (filters?.muscle_group) {
    result = result.filter(e => e.muscle_group === filters.muscle_group || e.secondary_muscles.includes(filters.muscle_group as any))
  }
  if (filters?.exercise_type) {
    result = result.filter(e => e.exercise_type === filters.exercise_type)
  }
  return result
}

/** Get exercise by ID */
export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISES.find(e => e.id === id)
}
