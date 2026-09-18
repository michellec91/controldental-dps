"use client";

import { ChangeEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaCamera,
  FaEnvelope,
  FaLock,
  FaPen,
  FaShieldAlt,
  FaSignOutAlt,
  FaUserCircle,
} from "react-icons/fa";

import { useAuth } from "../../../context/AuthContext";
import { useUploadThing } from "../../../lib/uploadthing-client";
import styles from "./PerfilCard.module.css";

export default function PerfilCard() {
  const { usuario, cerrarSesion, actualizarUsuarioSesion } = useAuth();

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

  const handleFoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

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

      const uploaded = await startUpload([file]);

      if (!uploaded || !uploaded[0]) {
        throw new Error("No fue posible subir la imagen.");
      }

      const nuevaImagen = uploaded[0].url;

      const respuesta = await fetch(
        `http://localhost:3001/usuarios/${usuario.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imagenPerfil: nuevaImagen,
          }),
        }
      );

      if (!respuesta.ok) {
        throw new Error("No fue posible actualizar el usuario.");
      }

      actualizarUsuarioSesion({
        imagenPerfil: nuevaImagen,
      });
    } catch (error) {
      console.error(error);
      alert("No fue posible actualizar la fotografía.");
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
            <FaUserCircle className={styles.defaultAvatar} />
          )}

          <span className={styles.cameraButton}>
            <FaCamera />
          </span>
        </button>

        <h2 className={styles.name}>{usuario.nombre}</h2>

        <p className={styles.role}>
          {usuario.rol === "admin"
            ? "Administrador"
            : usuario.rol}
        </p>

        <span className={styles.statusBadge}>
          <span className={styles.statusDot}></span>
          {usuario.estado === "activo"
            ? "Cuenta activa"
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
            onClick={() => router.push("/perfil/editar")}
          >
            <FaPen />
            Editar perfil
          </button>
        </div>

        <div className={styles.details}>
          <div className={styles.detailRow}>
            <div className={styles.label}>
              <FaUserCircle />
              Nombre
            </div>

            <span>{usuario.nombre}</span>
          </div>

          <div className={styles.detailRow}>
            <div className={styles.label}>
              <FaEnvelope />
              Correo electrónico
            </div>

            <span>{usuario.correo}</span>
          </div>

          <div className={styles.detailRow}>
            <div className={styles.label}>
              <FaShieldAlt />
              Rol
            </div>

            <span>
              {usuario.rol === "admin"
                ? "Administrador"
                : usuario.rol}
            </span>
          </div>

          <div className={styles.detailRow}>
            <div className={styles.label}>
              <FaShieldAlt />
              Estado
            </div>

            <span className={styles.activeText}>
              <span className={styles.smallDot}></span>
              {usuario.estado === "activo"
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
            onClick={() => router.push("/cambiar-password")}
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