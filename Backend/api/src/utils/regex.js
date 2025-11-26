export const regexNombre = /^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]{2,30}$/;

export const regexContrasenia = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

export const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const regexUrl = /^https?:\/\/[^\s$.?#].[^\s]*$/;
