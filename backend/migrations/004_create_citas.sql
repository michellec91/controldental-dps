CREATE TABLE IF NOT EXISTS citas (
  id_cita INT NOT NULL AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  id_tratamiento INT NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  estado VARCHAR(50) NOT NULL,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id_cita),

  CONSTRAINT fk_citas_usuario
    FOREIGN KEY (id_usuario)
    REFERENCES usuarios(id_usuario),

  CONSTRAINT fk_citas_tratamiento
    FOREIGN KEY (id_tratamiento)
    REFERENCES tratamientos(id_tratamiento)
);