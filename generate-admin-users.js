const bcryptjs = require('bcryptjs')

// Generar hashes de contraseñas para usuarios admin
async function generateHashes() {
  const users = [
    { nombre: 'Administrador', usuario: 'admin', password: 'admin123' },
    { nombre: 'Manager', usuario: 'manager', password: 'manager123' },
  ]

  console.log('-- Insert admin users with bcrypt hashed passwords')
  console.log("INSERT INTO admin_users (nombre, usuario, pwd, isActive) VALUES")

  const lines = []
  for (let i = 0; i < users.length; i++) {
    const user = users[i]
    const hash = await bcryptjs.hash(user.password, 10)
    const line = `('${user.nombre}', '${user.usuario}', '${hash}', true)`
    lines.push(line)
  }

  console.log(lines.join(',\n') + ';')
  console.log("\n-- Hashes generated successfully. Copy the SQL above to a migration.")
}

generateHashes().catch(console.error)
