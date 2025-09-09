/**********************
 * Configuración global
 **********************/
const SUBMIT_MODE = 'demo';
// Opciones: 'demo' | 'native' | 'fetch'
const FETCH_URL = 'https://httpbin.org/post'; // Cambia a tu endpoint si usas 'fetch'

// decide si los avisos son porr 'modal' (diálogo centrado) o el 'toast' (que es la barra de arriba)
const POPUP_TYPE = 'modal';

/**********************************
 * Resaltar link activo del navbar
 **********************************/
(function highlightActive() {
  const page = (window.location && window.location.pathname)
    ? (window.location.pathname.split('/').pop() || 'index.html').toLowerCase()
    : 'index.html';

  document.querySelectorAll('.navbar a').forEach(a => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    if (href === page) a.classList.add('active');
  });
})();

/**********************
 * Carrito de planes
 **********************/
//AQUI VA EL CÓDIGO DEL CARRITO (si es que lo hay)

/**********************
 * Helpers de avisos (Toast + Modal)
 **********************/
function showToast(msg, type = 'error') {
  const toast = document.getElementById('toast');
  if (!toast) { alert(msg); return; } // Respaldo si no existe el contenedor
  toast.textContent = msg;
  toast.className = type === 'success' ? 'success' : '';
  toast.style.display = 'block';
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => { toast.style.display = 'none'; }, 4000);
}
function hideToast() {
  const toast = document.getElementById('toast');
  if (toast) toast.style.display = 'none';
}

// Modal accesible
function setupModal() {
  const modal    = document.getElementById('appModal');
  const okBtn    = document.getElementById('modalOk');
  const backdrop = modal?.querySelector('.modal-backdrop');
  const close = () => { if (modal) modal.hidden = true; };

  okBtn?.addEventListener('click', close);
  backdrop?.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}
function showModal(message, title = 'Mensaje', type = 'info') {
  const modal   = document.getElementById('appModal');
  const msgEl   = document.getElementById('modalMsg');
  const titleEl = document.getElementById('modalTitle');
  if (!modal || !msgEl || !titleEl) { alert(message); return; } // respaldo

  if (!title) {
    title = (type === 'error') ? 'Hay errores' : (type === 'success' ? 'Listo' : 'Mensaje');
  }
  titleEl.textContent = title;
  msgEl.textContent   = message;
  modal.hidden = false;

  // Foco al botón aceptar
  setTimeout(() => document.getElementById('modalOk')?.focus(), 0);
}

// Enrutador único para notificaciones
function notify(message, type = 'error', title = '') {
  if (POPUP_TYPE === 'modal') {
    showModal(message, title || (type === 'error' ? 'Verifique los datos' : 'Mensaje'), type);
  } else {
    showToast(message, type);
  }
}

/**********************
 * Validación Contacto 
 **********************/

document.addEventListener('DOMContentLoaded', () => {
  // Inicializa modal (si existe en el HTML)
  setupModal();

  const form = document.getElementById('contactForm');
  if (!form) return;

  // --- Helpers de UI ---
  const ensureHint = (el) => {
    if (!el) return null;
    const next = el.nextElementSibling;
    if (next && next.classList && next.classList.contains('input-hint')) return next;
    const hint = document.createElement('small');
    hint.className = 'input-hint';
    el.insertAdjacentElement('afterend', hint);
    return hint;
  };
  const setError = (el, msg) => {
    if (!el) return;
    el.classList.add('input-error');
    const hint = ensureHint(el);
    if (hint) hint.textContent = msg || '';
  };
  const clearError = (el) => {
    if (!el) return;
    el.classList.remove('input-error');
    const hint = ensureHint(el);
    if (hint) hint.textContent = '';
  };

  // --- Normalización ---
  const normalizePhone = (v) => (v || '').replace(/[\s\-\(\)]/g, '');

  // --- Campos ---
  const fields = {
    nombre:            document.getElementById('nombre'),
    apellido:          document.getElementById('apellido'),
    nombre_clinica:    document.getElementById('nombre_clinica'),
    num_profesionales: document.getElementById('num_profesionales'),
    correo:            document.getElementById('correo'),
    telefono:          document.getElementById('telefono'),
    prefijo_pais:      document.getElementById('prefijo_pais'),
    mensaje:           document.getElementById('mensaje')
  };

  // --- Reglas ---
  const validators = {
    nombre: (v) => {
      if (!v.trim()) return 'El nombre es obligatorio.';
      if (v.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres.';
      return null;
    },
    apellido: (v) => {
      if (!v.trim()) return 'El apellido es obligatorio.';
      if (v.trim().length < 2) return 'El apellido debe tener al menos 2 caracteres.';
      return null;
    },
    nombre_clinica: (v) => {
      if (!v.trim()) return 'El nombre de la clínica es obligatorio.';
      if (v.trim().length < 3) return 'El nombre de la clínica debe tener al menos 3 caracteres.';
      return null;
    },
    num_profesionales: (v) => {
      if (!v.trim()) return 'El Nº de profesionales es obligatorio.';
      if (!/^\d+$/.test(v)) return 'El Nº de profesionales debe ser un número entero.';
      if (parseInt(v, 10) <= 0) return 'El Nº de profesionales debe ser mayor que 0.';
      return null;
    },
    correo: (v) => {
      if (!v.trim()) return 'El correo laboral es obligatorio.';
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!re.test(v)) return 'Formato de correo inválido.';
      return null;
    },
    telefono: (v) => {
      const nv = normalizePhone(v);
      if (!nv) return 'El número de teléfono es obligatorio.';
      if (!/^\d{8,12}$/.test(nv)) return 'El teléfono debe tener entre 8 y 12 dígitos (solo números).';
      return null;
    },
    mensaje: (v) => {
      if (!v.trim()) return 'El mensaje es obligatorio.';
      if (v.trim().length < 10) return 'El mensaje debe tener al menos 10 caracteres.';
      return null;
    }
  };

  // --- Feedback inmediato ---
  Object.keys(validators).forEach(key => {
    const el = fields[key];
    if (!el) return;
    el.addEventListener('input', () => { clearError(el); hideToast(); });
    el.addEventListener('blur', () => {
      const value = key === 'telefono' ? normalizePhone(el.value) : el.value;
      const err = validators[key](value);
      if (err) setError(el, err); else clearError(el);
    });
  });

  // --- Envío ---
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (fields.telefono) fields.telefono.value = normalizePhone(fields.telefono.value);

    let firstErrorEl = null;
    let firstMsg = '';

    // Validación total
    Object.keys(validators).forEach(key => {
      const el = fields[key];
      if (!el) return;
      const value = key === 'telefono' ? normalizePhone(el.value) : el.value;
      const err = validators[key](value);
      if (err) {
        setError(el, err);
        if (!firstErrorEl) { firstErrorEl = el; firstMsg = err; }
      } else {
        clearError(el);
      }
    });

    if (firstErrorEl) {
      firstErrorEl.focus();
      notify(firstMsg, 'error', 'Verifique los datos');
      return;
    }

    // Datos listos para enviar
    const payload = {
      nombre: fields.nombre?.value.trim(),
      apellido: fields.apellido?.value.trim(),
      nombre_clinica: fields.nombre_clinica?.value.trim(),
      num_profesionales: parseInt(fields.num_profesionales?.value, 10),
      correo: fields.correo?.value.trim(),
      telefono: `${fields.prefijo_pais?.value || ''}${normalizePhone(fields.telefono?.value)}`,
      mensaje: fields.mensaje?.value.trim()
    };

    if (SUBMIT_MODE === 'demo') {
      console.log('[CONTACTO] Datos validados:', payload);
      notify('¡Formulario enviado con éxito! (demo)', 'success', 'Envío exitoso');
      form.reset();
      Object.values(fields).forEach(el => el && clearError(el));
      return;
    }

    if (SUBMIT_MODE === 'native') {
      form.submit();
      return;
    }

    if (SUBMIT_MODE === 'fetch') {
      try {
        notify('Enviando...', 'success', 'Procesando');
        const res = await fetch(FETCH_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        notify('¡Formulario enviado con éxito!', 'success', 'Envío exitoso');
        form.reset();
        Object.values(fields).forEach(el => el && clearError(el));
      } catch (err) {
        console.error('[CONTACTO] Error al enviar:', err);
        notify('No se pudo enviar. Inténtalo más tarde.', 'error', 'Error');
      }
      return;
    }

    // Fallback
    notify('¡Formulario enviado con éxito!', 'success', 'Envío exitoso');
    form.reset();
    Object.values(fields).forEach(el => el && clearError(el));
  });
});

console.log('Cargó js/script.js ✅');

/**********************
 * Validaciones Login & Registro – Dr. Fachero
 **********************/
document.addEventListener('DOMContentLoaded', () => {
  // helpers para hints/errores
  const ensureHint2 = (el) => {
    if (!el) return null;
    const next = el.nextElementSibling;
    if (next && next.classList?.contains('input-hint')) return next;
    const hint = document.createElement('small');
    hint.className = 'input-hint';
    el.insertAdjacentElement('afterend', hint);
    return hint;
  };
  const setFieldError = (el, msg) => {
    if (!el) return;
    el.classList.add('input-error');
    const h = ensureHint2(el);
    if (h) h.textContent = msg || '';
  };
  const clearFieldError = (el) => {
    if (!el) return;
    el.classList.remove('input-error');
    const h = ensureHint2(el);
    if (h) h.textContent = '';
  };

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const passRe  = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/; // 8+ caracteres y al menos 1 letra y 1 número

  /*********** LOGIN ***********/
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    const email = loginForm.querySelector('#email');
    const pass  = loginForm.querySelector('#password');

    // feedback inmediato
    [email, pass].forEach(el => {
      el?.addEventListener('input', () => clearFieldError(el));
      el?.addEventListener('blur', () => {
        if (el === email) {
          if (!email.value.trim()) return setFieldError(email, 'El correo es obligatorio.');
          if (!emailRe.test(email.value.trim())) return setFieldError(email, 'Formato de correo inválido.');
        }
        if (el === pass) {
          if (!pass.value.trim()) return setFieldError(pass, 'La contraseña es obligatoria.');
          if (pass.value.length < 8) return setFieldError(pass, 'La contraseña debe tener al menos 8 caracteres.');
        }
        clearFieldError(el);
      });
    });

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Validación
      let first = null;
      if (!email.value.trim()) { setFieldError(email, 'El correo es obligatorio.'); first ||= email; }
      else if (!emailRe.test(email.value.trim())) { setFieldError(email, 'Formato de correo inválido.'); first ||= email; }
      else { clearFieldError(email); }

      if (!pass.value.trim()) { setFieldError(pass, 'La contraseña es obligatoria.'); first ||= pass; }
      else if (pass.value.length < 8) { setFieldError(pass, 'La contraseña debe tener al menos 8 caracteres.'); first ||= pass; }
      else { clearFieldError(pass); }

      if (first) {
        first.focus();
        notify('Revisa los campos marcados.', 'error', 'Verifique los datos');
        return;
      }

      // Datos listos
      const payload = { email: email.value.trim(), password: pass.value };

      if (SUBMIT_MODE === 'demo') {
        console.log('[LOGIN] OK (demo):', payload);
        notify('¡Bienvenido! Inicio de sesión correcto (demo).', 'success', 'Listo');
        setTimeout(() => { window.location.href = 'index.html'; }, 900);
        return;
      }

      if (SUBMIT_MODE === 'native') {
        loginForm.submit();
        return;
      }

      if (SUBMIT_MODE === 'fetch') {
        try {
          notify('Validando credenciales...', 'success', 'Procesando');
          const res = await fetch(FETCH_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          notify('Sesión iniciada con éxito.', 'success', 'Listo');
          setTimeout(() => { window.location.href = 'index.html'; }, 900);
        } catch (err) {
          console.error('[LOGIN] Error:', err);
          notify('Credenciales inválidas o servicio no disponible.', 'error', 'No se pudo iniciar sesión');
        }
        return;
      }

      // Fallback
      notify('Sesión iniciada.', 'success', 'Listo');
    });
  }

  /*********** REGISTRO ***********/
  const regForm = document.getElementById('registerForm');
  if (regForm) {
    const nombre   = regForm.querySelector('#nombre');
    const email    = regForm.querySelector('#email');
    const pass     = regForm.querySelector('#password');
    const confirm  = regForm.querySelector('#confirmar-password');

    const validators = {
      nombre: (v) => {
        if (!v.trim()) return 'El nombre completo es obligatorio.';
        if (v.trim().length < 3) return 'Debe tener al menos 3 caracteres.';
        return null;
      },
      email: (v) => {
        if (!v.trim()) return 'El correo es obligatorio.';
        if (!emailRe.test(v.trim())) return 'Formato de correo inválido.';
        return null;
      },
      pass: (v) => {
        if (!v) return 'La contraseña es obligatoria.';
        if (!passRe.test(v)) return 'Mínimo 8 caracteres, con letras y números.';
        return null;
      },
      confirm: (v) => {
        if (!v) return 'Debes confirmar la contraseña.';
        if (v !== pass.value) return 'Las contraseñas no coinciden.';
        return null;
      }
    };

    const runOne = (el, fn) => {
      const msg = fn(el.value);
      if (msg) { setFieldError(el, msg); return false; }
      clearFieldError(el); return true;
    };

    // feedback inmediato
    nombre?.addEventListener('input', () => clearFieldError(nombre));
    email?.addEventListener('input', () => clearFieldError(email));
    pass?.addEventListener('input', () => clearFieldError(pass));
    confirm?.addEventListener('input', () => clearFieldError(confirm));

    [ [nombre,'nombre'], [email,'email'], [pass,'pass'], [confirm,'confirm'] ].forEach(([el,key])=>{
      el?.addEventListener('blur', () => runOne(el, validators[key]));
    });

    regForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Validación total
      const okNombre  = runOne(nombre,  validators.nombre);
      const okEmail   = runOne(email,   validators.email);
      const okPass    = runOne(pass,    validators.pass);
      const okConfirm = runOne(confirm, validators.confirm);

      if (!(okNombre && okEmail && okPass && okConfirm)) {
        notify('Revisa los campos marcados.', 'error', 'Verifique los datos');
        const firstErr = [nombre,email,pass,confirm].find(el => el.classList.contains('input-error'));
        firstErr?.focus();
        return;
      }

      const payload = {
        nombre: nombre.value.trim(),
        email: email.value.trim(),
        password: pass.value
      };

      if (SUBMIT_MODE === 'demo') {
        console.log('[REGISTRO] OK (demo):', payload);
        notify('¡Cuenta creada con éxito! (demo)', 'success', 'Registro completado');
        regForm.reset();
        [nombre,email,pass,confirm].forEach(clearFieldError);
        setTimeout(() => { window.location.href = 'login.html'; }, 1000);
        return;
      }

      if (SUBMIT_MODE === 'native') {
        regForm.submit();
        return;
      }

      if (SUBMIT_MODE === 'fetch') {
        try {
          notify('Creando cuenta...', 'success', 'Procesando');
          const res = await fetch(FETCH_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          notify('¡Cuenta creada con éxito!', 'success', 'Registro completado');
          regForm.reset();
          [nombre,email,pass,confirm].forEach(clearFieldError);
          setTimeout(() => { window.location.href = 'login.html'; }, 900);
        } catch (err) {
          console.error('[REGISTRO] Error:', err);
          notify('No se pudo crear la cuenta. Intenta más tarde.', 'error', 'Error');
        }
        return;
      }

      // Fallback
      notify('¡Cuenta creada con éxito!', 'success', 'Registro completado');
    });
  }
});


/**********************
 * Recuperar Contraseña – Validación/Envío
 **********************/
document.addEventListener('DOMContentLoaded', () => {
  const forgotForm = document.getElementById('forgotForm');
  if (!forgotForm) return;

  const emailInput = forgotForm.querySelector('#forgotEmail');
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  // helpers reutilizando clases CSS
  const ensureHint = (el) => {
    if (!el) return null;
    const next = el.nextElementSibling;
    if (next && next.classList?.contains('input-hint')) return next;
    const hint = document.createElement('small');
    hint.className = 'input-hint';
    el.insertAdjacentElement('afterend', hint);
    return hint;
  };
  const setError = (el, msg) => {
    if (!el) return;
    el.classList.add('input-error');
    const hint = ensureHint(el);
    if (hint) hint.textContent = msg || '';
  };
  const clearError = (el) => {
    if (!el) return;
    el.classList.remove('input-error');
    const hint = ensureHint(el);
    if (hint) hint.textContent = '';
  };

  // feedback inmediato
  emailInput?.addEventListener('input', () => clearError(emailInput));
  emailInput?.addEventListener('blur', () => {
    const v = emailInput.value.trim();
    if (!v) return setError(emailInput, 'El correo es obligatorio.');
    if (!emailRe.test(v)) return setError(emailInput, 'Formato de correo inválido.');
    clearError(emailInput);
  });

  forgotForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    let hasError = false;

    if (!email) { setError(emailInput, 'El correo es obligatorio.'); hasError = true; }
    else if (!emailRe.test(email)) { setError(emailInput, 'Formato de correo inválido.'); hasError = true; }
    else { clearError(emailInput); }

    if (hasError) {
      notify('Revisa el correo ingresado.', 'error', 'Verifique los datos');
      emailInput.focus();
      return;
    }

    const payload = { email };

    if (SUBMIT_MODE === 'demo') {
      console.log('[RECUPERAR] (demo):', payload);
      notify('Si el correo existe, te enviaremos un enlace para restablecer la contraseña.', 'success', 'Solicitud recibida');
      forgotForm.reset();
      return;
    }

    if (SUBMIT_MODE === 'native') {
      forgotForm.submit();
      return;
    }

    if (SUBMIT_MODE === 'fetch') {
      try {
        notify('Procesando solicitud...', 'success', 'Enviando');
        const res = await fetch(FETCH_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        // Respuesta genérica segura (no revela si el email existe)
        notify('Si el correo existe, te enviaremos un enlace para restablecer la contraseña.', 'success', 'Solicitud recibida');
        forgotForm.reset();
      } catch (err) {
        console.error('[RECUPERAR] Error:', err);
        notify('No se pudo procesar la solicitud. Intenta más tarde.', 'error', 'Error');
      }
      return;
    }

    // Fallback
    notify('Si el correo existe, te enviaremos un enlace para restablecer la contraseña.', 'success', 'Solicitud recibida');
    forgotForm.reset();
  });
});
