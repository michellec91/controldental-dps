CREATE TABLE IF NOT EXISTS horarios (
  id_horario INT NOT NULL AUTO_INCREMENT,
  dia_semana VARCHAR(20) NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  estado VARCHAR(50) NOT NULL,

  PRIMARY KEY (id_horario)
);