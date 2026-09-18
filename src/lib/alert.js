import Swal from 'sweetalert2';

// Toast pequeño arriba a la derecha (para éxito/info)
export const toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    },
})

// Alerta para
export const alertSuccess = (title, text = '') => {
    toast.fire({
        icon: 'success',
        title,
        text,
    })
}

// Alerta para errores
export const alertError = (title, text = '') => {
    Swal.fire({
        icon: 'error',
        title,
        text,
        confirmButtonColor: '#2563eb',
        confirmButtonText: 'Aceptar',
    })
}

// Alertas de confirmación para los segmentos de eliminacion.
export const alertConfirm = async ({
    title = '¿Estás seguro?',
    text = 'Esta acción no se puede deshacer',
    confirmText = 'Sí, continuar',
    cancelText = 'Cancelar',
    danger = false,
} = {}) => {
    const result = await Swal.fire({
        title,
        text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: danger ? '#dc2626' : '#2563eb',
        cancelButtonColor: '#6b7280',
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        reverseButtons: true,
    })
    return result.isConfirmed
}