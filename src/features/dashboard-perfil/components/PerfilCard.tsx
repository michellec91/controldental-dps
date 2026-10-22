"use client";

import { ChangeEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaCamera,
  FaEnvelope,
  FaLock,
  FaPen,
  FaPhone,
  FaShieldAlt,
  FaSignOutAlt,
  FaUserCircle,
} from "react-icons/fa";

import { useAuth } from "../../../context/AuthContext";
import { useUploadThing } from "../../../lib/uploadthing-client";
import { actualizarImagenPerfil } from "../../../services/usuariosService";
import styles from "./PerfilCard.module.css";

export default function PerfilCard() {
  const {
    usuario,
    cerrarSesion,
    actualizarUsuarioSesion,
  } = useAuth();

  const router = useRouter();
  const inputFotoRef = useRef<HTMLInputElement>(null);

  const [subiendoFoto, setSubiendoFoto] = useState(false);

  const { startUpload } = useUploadThing("imageUploader");

  if (!usuario) {
    return null;
  }

  const handleSeleccionarFoto = () => {
    inputFotoRef.current?.click();
  };

  const handleFoto = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Selecciona un archivo de imagen.");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      alert("La imagen no puede superar los 4 MB.");
      return;
    }

    try {
      setSubiendoFoto(true);

      // 1. Subir la imagen a UploadThing
      const uploaded = await startUpload([file]);

      if (!uploaded || uploaded.length === 0) {
        throw new Error(
          "No fue posible subir la imagen a UploadThing."
        );
      }

      // Algunas versiones de UploadThing usan ufsUrl
      // y otras también incluyen url.
      const nuevaImagen =
        uploaded[0].ufsUrl ||
        uploaded[0].url;

      if (!nuevaImagen) {
        throw new Error(
          "UploadThing no devolvió una URL válida."
        );
      }

      // 2. Guardar la URL en MySQL mediante nuestra API
      await actualizarImagenPerfil(
        usuario.id,
        nuevaImagen
      );

      // 3. Actualizar AuthContext y localStorage
      actualizarUsuarioSesion({
        imagenPerfil: nuevaImagen,
      });

      alert("Fotografía actualizada correctamente.");
    } catch (error) {
      console.error(
        "Error al actualizar fotografía:",
        error
      );

      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert(
          "No fue posible actualizar la fotografía."
        );
      }
    } finally {
      setSubiendoFoto(false);

      if (inputFotoRef.current) {
        inputFotoRef.current.value = "";
      }
    }
  };

  const handleCerrarSesion = () => {
    cerrarSesion();
    router.replace("/login");
  };

  const nombreCompleto = [
    usuario.nombre,
    usuario.apellido,
  ]
    .filter(Boolean)
    .join(" ");

  const esAdministrador =
    usuario.rol?.toLowerCase() ===
    "administrador";

  const estaActivo =
    usuario.estado?.toLowerCase() ===
    "activo";

  return (
    <section className={styles.card}>
      <div className={styles.profileColumn}>
        <input
          ref={inputFotoRef}
          type="file"
          accept="image/*"
          onChange={handleFoto}
          className={styles.hiddenInput}
        />

        <button
          type="button"
          className={styles.avatarButton}
          onClick={handleSeleccionarFoto}
          disabled={subiendoFoto}
          aria-label="Cambiar fotografía de perfil"
        >
          {usuario.imagenPerfil ? (
            <span
              className={styles.avatarImage}
              style={{
                backgroundImage: `url("${usuario.imagenPerfil}")`,
              }}
            />
          ) : (
            <FaUserCircle
              className={styles.defaultAvatar}
            />
          )}

          <span className={styles.cameraButton}>
            <FaCamera />
          </span>
        </button>

        <h2 className={styles.name}>
          {nombreCompleto}
        </h2>

        <p className={styles.role}>
          {esAdministrador
            ? "Administrador"
            : usuario.rol}
        </p>

        <span className={styles.statusBadge}>
          <span className={styles.statusDot}></span>

          {estaActivo
            ? "Activo"
            : usuario.estado}
        </span>

        {subiendoFoto && (
          <p className={styles.uploadText}>
            Actualizando fotografía...
          </p>
        )}
      </div>

      <div className={styles.contentColumn}>
        <div className={styles.sectionHeader}>
          <div>
            <span className={styles.eyebrow}>
              Cuenta administrativa
            </span>

            <h3>Información personal</h3>
          </div>

          <button
            type="button"
            className={styles.editButton}
            onClick={() =>
              router.push("/perfil/editar")
            }
          >
            <FaPen />
            Editar perfil
          </button>
        </div>

        <div className={styles.details}>
          <div className={styles.detailRow}>
            <div className={styles.label}>
              <FaUserCircle />
              <span>Nombre</span>
            </div>

            <span className={styles.value}>
              {usuario.nombre}
            </span>
          </div>

          <div className={styles.detailRow}>
            <div className={styles.label}>
              <FaUserCircle />
              <span>Apellido</span>
            </div>

            <span className={styles.value}>
              {usuario.apellido ||
                "No registrado"}
            </span>
          </div>

          <div className={styles.detailRow}>
            <div className={styles.label}>
              <FaEnvelope />
              <span>Correo electrónico</span>
            </div>

            <span className={styles.value}>
              {usuario.correo}
            </span>
          </div>

          <div className={styles.detailRow}>
            <div className={styles.label}>
              <FaPhone />
              <span>Teléfono</span>
            </div>

            <span className={styles.value}>
              {usuario.telefono ||
                "No registrado"}
            </span>
          </div>

          <div className={styles.detailRow}>
            <div className={styles.label}>
              <FaShieldAlt />
              <span>Rol</span>
            </div>

            <span className={styles.value}>
              {esAdministrador
                ? "Administrador"
                : usuario.rol}
            </span>
          </div>

          <div className={styles.detailRow}>
            <div className={styles.label}>
              <FaShieldAlt />
              <span>Estado</span>
            </div>

            <span className={styles.activeText}>
              <span className={styles.smallDot}></span>

              {estaActivo
                ? "Activo"
                : usuario.estado}
            </span>
          </div>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.security}>
          <div className={styles.securityInfo}>
            <div className={styles.securityIcon}>
              <FaLock />
            </div>

            <div>
              <h3>Seguridad de la cuenta</h3>

              <p>
                Contraseña
                <span className={styles.password}>
                  ••••••••••••
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            className={styles.passwordButton}
            onClick={() =>
              router.push(
                "/perfil/cambiar-password"
              )
            }
          >
            Cambiar contraseña
          </button>
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.logoutButton}
            onClick={handleCerrarSesion}
          >
            <FaSignOutAlt />
            Cerrar sesión
          </button>
        </div>
      </div>
    </section>
  );
}