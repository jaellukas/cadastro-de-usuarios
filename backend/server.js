import cors from 'cors'
import express from 'express'
import postgres from 'postgres'
import 'dotenv/config'

const app = express()
app.use(express.json())
app.use(cors())

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' })

app.post('/usuarios', async (req, res) => {
    try {
        const name = req.body.name || req.body.nomne || ""
        const email = req.body.email || ""
        const age = req.body.age || req.body.idade || null

        const [newUser] = await sql`
            INSERT INTO "User" (name, email, age) 
            VALUES (${name}, ${email}, ${age})
            RETURNING *
        `

        res.status(201).json(newUser)
    } catch (error) {
        console.error("ERRO NO BANCO:", error.message)
        res.status(500).json({ error: error.message })
    }
})

app.get('/usuarios', async (req, res) => {
    try {
        const { name, email, age } = req.query


        const filters = []
        if (name) filters.push(sql`name ILIKE ${'%' + name + '%'}`)
        if (email) filters.push(sql`email ILIKE ${'%' + email + '%'}`)
        if (age) filters.push(sql`age = ${age}`)

        let users

        if (filters.length > 0) {
            users = await sql`
                SELECT * FROM "User" 
                WHERE ${sql.and(filters)}
            `
        } else {
            // Se nenhum filtro foi passado na URL, busca tudo
            users = await sql`SELECT * FROM "User"`
        }

        res.status(200).json(users)
    } catch (error) {
        console.error("ERRO NO BANCO:", error.message)
        res.status(500).json({ error: error.message })
    }
})
// 3. PUT - Atualizar usuário por ID na URL (Ex: /usuarios/1)
app.put('/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params // Pega o ID da URL
        const name = req.body.name || req.body.nomne || ""
        const email = req.body.email || ""
        const age = req.body.age || req.body.idade || null

        const [updatedUser] = await sql`
            UPDATE "User"
            SET name = ${name}, email = ${email}, age = ${age}
            WHERE id = ${id}
            RETURNING *
        `

        if (!updatedUser) {
            return res.status(404).json({ error: "Usuário não encontrado" })
        }

        res.status(200).json(updatedUser)
    } catch (error) {
        console.error("ERRO NO BANCO:", error.message)
        res.status(500).json({ error: error.message })
    }
})

// 4. DELETE - Remover usuário por ID na URL (Ex: /usuarios/1)
app.delete('/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params // Pega o ID da URL

        const [deletedUser] = await sql`
            DELETE FROM "User"
            WHERE id = ${id}
            RETURNING *
        `

        if (!deletedUser) {
            return res.status(404).json({ error: "Usuário não encontrado" })
        }

        res.status(200).json({ message: "Usuário deletado com sucesso!" })
    } catch (error) {
        console.error("ERRO NO BANCO:", error.message)
        res.status(500).json({ error: error.message })
    }
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});