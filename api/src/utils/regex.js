
export const regexNombre = /^[A-Za-z0-9._-]{6,25}$/;
export const regexContrasenia = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[._-]).{5,25}$/
export const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const regexUrl = /^[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-a-zA-Z0-9()@:%_+.~#?&\/=]*$/;
export const regexUrlHttp = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-a-zA-Z0-9()@:%_+.~#?&\/=]*$/;
