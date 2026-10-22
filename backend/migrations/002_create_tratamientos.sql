CREATE TABLE IF NOT EXISTS tratamientos (
  id_tratamiento INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  duracion INT NOT NULL,
  estado VARCHAR(50) NOT NULL,
  imagen VARCHAR(255) NULL,

  PRIMARY KEY (id_tratamiento)
);