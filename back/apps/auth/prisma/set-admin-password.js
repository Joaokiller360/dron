/* eslint-disable */
// Sets an admin's password straight in the database (no API, no current
// password: whoever can run this already has DATABASE_URL). Signs out every
// session of that admin.
//
//   npm run admin:password                 (locally, uses back/.env)
//   node prisma/set-admin-password.js      (inside the auth container)
//   … [email]                              (optional; asked if there are several admins)
//
// Press Enter at the password prompt to generate a strong random one.
const readline = require('readline');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@jbskylens/prisma-auth');

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789-_.!?';

function generate() {
  for (;;) {
    const pwd = Array.from({ length: 24 }, () => ALPHABET[crypto.randomInt(ALPHABET.length)]).join('');
    if (/\d/.test(pwd) && /[A-Za-z]/.test(pwd)) return pwd;
  }
}

// Same rules as the API's ChangePasswordDto
function problem(pwd, email) {
  if (pwd.length < 12) return 'debe tener al menos 12 caracteres';
  if (pwd.length > 128) return 'admite hasta 128 caracteres';
  if (!/\p{L}/u.test(pwd)) return 'debe tener al menos una letra';
  if (!/\d/.test(pwd)) return 'debe tener al menos un número';
  const handle = email.split('@')[0].toLowerCase();
  if (handle.length >= 4 && pwd.toLowerCase().includes(handle)) return 'no debe contener tu correo';
  return null;
}

function ask(question, hidden = false) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    let muted = false;
    rl._writeToOutput = (s) => {
      if (!muted) rl.output.write(s);
    };
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write('\n');
      resolve(answer);
    });
    muted = hidden; // the prompt is already printed; hide what's typed
  });
}

async function main() {
  const prisma = new PrismaClient();
  try {
    const admins = await prisma.adminUser.findMany({ select: { id: true, email: true } });
    if (!admins.length) throw new Error('No hay usuarios admin en la base de datos');

    let email = process.argv[2]?.trim().toLowerCase();
    if (!email) {
      email =
        admins.length === 1
          ? admins[0].email
          : (await ask(`Correo del admin (${admins.map((a) => a.email).join(', ')}): `)).trim().toLowerCase();
    }
    const admin = admins.find((a) => a.email.toLowerCase() === email);
    if (!admin) throw new Error(`No existe el admin ${email}`);
    console.log(`Admin: ${admin.email}`);

    let pwd = await ask('Nueva contraseña (Enter = generar una segura): ', true);
    const generated = !pwd;
    if (generated) {
      pwd = generate();
    } else {
      const bad = problem(pwd, admin.email);
      if (bad) throw new Error(`La contraseña ${bad}`);
      if ((await ask('Repite la contraseña: ', true)) !== pwd) throw new Error('Las contraseñas no coinciden');
    }

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { passwordHash: await bcrypt.hash(pwd, 12), passwordChangedAt: new Date() },
    });
    // Refresh tokens (table exists once the refresh_tokens migration is applied)
    await prisma.refreshToken
      ?.updateMany({ where: { userId: admin.id, revokedAt: null }, data: { revokedAt: new Date() } })
      .catch(() => undefined);

    console.log('\nContraseña cambiada. Se cerraron todas las sesiones de este admin.');
    if (generated) {
      console.log('Guárdala YA en tu gestor de contraseñas (no se vuelve a mostrar):\n');
      console.log(`    ${pwd}\n`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(`\nError: ${err.message}`);
  process.exit(1);
});
