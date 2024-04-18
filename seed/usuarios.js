import bcrypt from 'bcrypt';

const usuarios = [
    {
        name: 'Admin',
        email: 'admin@admin.com',
        confirm: true,
        password:bcrypt.hashSync('123456', 10),
    }
]

export default usuarios;