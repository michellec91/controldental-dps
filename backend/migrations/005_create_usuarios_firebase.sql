CREATE TABLE IF NOT EXISTS usuarios_firebase (
  firebase_uid VARCHAR(128) NOT NULL,
  id_usuario INT NOT NULL,
  fecha_vinculacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (firebase_uid),
  UNIQUE KEY uq_usuario_firebase_id_usuario (id_usuario),
  CONSTRAINT fk_usuarios_firebase_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuarios (id_usuario) ON DELETE CASCADE
);
