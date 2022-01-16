const express = require('express')
const app = express()
const PORT = process.env.PORT || 8080

let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const fetch = require('node-fetch');

let conn

const connect = () => {
    let { Client } = require('pg')

    console.log('Connecting...')

    conn = new Client({
        host: 'localhost',
        database: 'crud_delta',
        user: 'postgres',
        password: 'joaodev',
        port: 5432
    })

    console.log('Connecting yet...')

    conn.connect()

    console.log('Connected')
}

const createTables = async () => {

    await conn.query(`
    CREATE TABLE IF NOT EXISTS CATEGORIAS (
        id integer PRIMARY KEY,
        nome varchar,
        descricao varchar
    )
    `)

    await conn.query(`
    CREATE TABLE IF NOT EXISTS PRODUTOS (
        id integer PRIMARY KEY,
        nome VARCHAR (255),
        preco VARCHAR (255),
        descricao VARCHAR (255),
        categoria_id INTEGER NOT NULL
    );
    `)

    console.log('Table created')
}

(async () => {
    connect()
    await createTables()
})()

// TELA INICIAL
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/views/index.html')
})

// CRIA CATEGORIA
app.post('/categorias', async (req, res) => {
    const categoria = req.body
    console.log(categoria)
    console.log(`insert into CATEGORIAS (id, nome, descricao) values (${categoria.id}, '${categoria.nome}', '${categoria.descricao}')`)

    let { rows } = await conn.query(`
        insert into CATEGORIAS (id, nome, descricao) values (${categoria.id}, '${categoria.nome}', '${categoria.descricao}')
    `)

    console.log(`Rows inserted: ${rows.length}`)

    res.redirect('/categorias')
})

// VISUALIZA CATEGORIA BASEADO NO ID
app.get('/categorias/:id', async (req, res) => {
    const {id} = req.params

    let { rows } = await conn.query(`SELECT * FROM CATEGORIAS`)
    for (let row of rows) {
        console.log(row)
        if (row.id == id) {
            res.send(`
                <h1>Categoria ID: </h1>
                <p>${row.id}</p>
                <br>
                <h1>Categoria Nome: </h1>
                <p>${row.nome}</p>
                <br>
                <h1>Categoria Descrição: </h1>
                <p>${row.descricao}</p>
                <br>
            `)
        }
    }

    res.send(`<h1>Categoria não encontrada :/</h1>`)
})

// LISTA TODAS AS CATEGORIAS
app.get('/categorias', async (req, res) => {
    let categoriasHTML = ''

    let { rows } = await conn.query(`SELECT * FROM CATEGORIAS`)

    rows.forEach((row) => {
        categoriasHTML +=
        `
            <div style="border-bottom: 2.5px solid black; border-top: 2.5px solid black">
                <h1>Categoria ID: </h1>
                <p>${row.id}</p>
                <h1>Categoria Nome: </h1>
                <p>${row.nome}</p>
                <h1>Categoria Descricao: </h1>
                <p>${row.descricao}</p>
            </div>
        `
    })

    //console.log(categoriasHTML)
    res.send(categoriasHTML)
})

// ATUALIZA CATEGORIA BASEADO NO ID
app.put('/categorias/:id', async (req, res) => {
    const {id} = req.params
    const formData = req.body

    console.log(formData)

    await conn.query(
    `
        UPDATE CATEGORIAS
        SET nome = '${formData.nome}', descricao = '${formData.descricao}'
        WHERE id = ${id}
    `)

    res.send('success')
})

// DELETA CATEGORIA BASEADO NO ID
app.delete('/categorias/:id', async (req, res) => {
    const {id} = req.params
    console.log(id)
    console.log('Deletou')
    await conn.query(`
        DELETE FROM CATEGORIAS
        WHERE id = ${id}
    `)
    res.send('success')
})

// ============================================

// CRIA PRODUTO
app.post('/produtos', async (req, res) => {
    const produto = req.body
    console.log(produto)

    let { rows } = await conn.query(`
        insert into PRODUTOS (id, nome, preco, descricao, categoria_id) values (${produto.id}, '${produto.nome}', '${produto.preco}', '${produto.descricao}', ${produto.categoria_id})
    `)

    console.log(`Rows inserted: ${rows.length}`)

    res.redirect('/produtos')
})

// VISUALIZA PRODUTO BASEADO NO ID
app.get('/produtos/:id', async (req, res) => {
    const {id} = req.params

    let { rows } = await conn.query(`SELECT * FROM PRODUTOS`)
    for (let row of rows) {
        console.log(row)
        if (row.id == id) {
            res.send(`
            <div style="border-bottom: 2.5px solid black; border-top: 2.5px solid black">
                <h1>Produto ID: </h1>
                <p>${row.id}</p>
                <h1>Produto Nome: </h1>
                <p>${row.nome}</p>
                <h1>Produto Descricao: </h1>
                <p>${row.descricao}</p>
                <h1>Produto Preço: </h1>
                <p>${row.preco}</p>
                <h1>Categoria ID: </h1>
                <p>${row.categoria_id}</p>
            </div>
            `)
        }
    }

    res.send(`<h1>Produto não encontrado :/</h1>`)
})

// LISTA TODOS OS PRODUTOS
app.get('/produtos', async (req, res) => {
    let produtosHTML = ''

    let { rows } = await conn.query(`SELECT * FROM PRODUTOS`)

    rows.forEach((row) => {
        console.log('Coluna: ')
        console.log(row)
        produtosHTML +=
        `
            <div style="border-bottom: 2.5px solid black; border-top: 2.5px solid black">
                <h1>Produto ID: </h1>
                <p>${row.id}</p>
                <h1>Produto Nome: </h1>
                <p>${row.nome}</p>
                <h1>Produto Descricao: </h1>
                <p>${row.descricao}</p>
                <h1>Produto Preço: </h1>
                <p>${row.preco}</p>
                <h1>Categoria ID: </h1>
                <p>${row.categoria_id}</p>
            </div>
        `
    })

    res.send(produtosHTML)
})

// ATUALIZA CATEGORIA BASEADO NO PRODUTO
app.put('/produtos/:id', async (req, res) => {
    const {id} = req.params
    const formData = req.body

    console.log(formData)

    await conn.query(
    `
        UPDATE PRODUTOS
        SET nome = '${formData.nome}', descricao = '${formData.descricao}', preco = '${formData.preco}', categoria_id = ${id}
        WHERE id = ${id}
    `)

    res.send('success')
})

// DELETA PRODUTO BASEADO NO ID
app.delete('/produtos/:id', async (req, res) => {
    const {id} = req.params
    await conn.query(`
        DELETE FROM PRODUTOS
        WHERE id = ${id}
    `)
    res.send('success')
})

// ============================================
//    TELAS PARA ADICIONAR/REMOVER/ATUALIZAR
// ============================================
app.get('/adicionar/:tabela', (req, res) => {
    const tabela = req.params.tabela
    if (tabela === 'CATEGORIAS') {
        res.send(`
            <form action="/categorias" method="POST">
                <label>ID</label>
                <br>
                <input name="id" type="number" min="0">
                <br>
                <label>Nome</label>
                <br>
                <input name="nome" type="text">
                <br>
                <label>Descrição</label>
                <br>
                <input name="descricao" type="text">
                <br>
                <input type="submit" value="Adicionar categoria">
                <br>
            </form>
        `)
    } else if (tabela === 'PRODUTOS') {
        res.send(`
            <form action="/produtos" method="POST">
                <label>ID</label>
                <br>
                <input name="id" type="number" min="0">
                <br>
                <label>Nome</label>
                <br>
                <input name="nome" type="text">
                <br>
                <label>Descrição</label>
                <br>
                <input name="descricao" type="text">
                <br>
                <label>Preço</label>
                <br>
                <input name="preco" type="number" min="0">
                <br>
                <label>Categoria ID<label>
                <br>
                <input name="categoria_id" type="number" min="0">
                <br>
                <input type="submit" value="Adicionar produto">
                <br>
            </form>
        `)
    } else {
        res.send(`<h1>Tabela não encontrada</h1>`)
    }
})

app.get('/remover/:tabela', (req, res) => {
    const tabela = req.params.tabela
    if (tabela === 'CATEGORIAS') {
        res.send(`
            <form action="/delete/categorias" method="POST">
                <label>ID</label>
                <br>
                <input id="getID" name="id" type="number" min="0">
                <br>
                <input type="submit" value="Remover">
            </form>
        `)
    } else if (tabela === 'PRODUTOS') {
        res.send(`
            <form action="/delete/produtos" method="POST">
                <label>ID</label>
                <br>
                <input id="getID" name="id" type="number" min="0">
                <br>
                <input type="submit" value="Remover">
            </form>
        `)
    } else {
        res.send(`<h1>Tabela não encontrada</h1>`)
    }
})

app.get('/atualizar/:tabela', (req, res) => {
    const tabela = req.params.tabela
    if (tabela === 'CATEGORIAS') {
        res.send(`
            <form action="/put/categorias" method="POST">
                <label>ID</label>
                <br>
                <input name="id" type="number" min="0">
                <br>
                <label>Nome</label>
                <br>
                <input name="nome" type="text">
                <br>
                <label>Descrição</label>
                <br>
                <input name="descricao" type="text">
                <br>
                <input type="submit" value="Atualizar categoria">
                <br>
            </form>
        `)
    } else if (tabela === 'PRODUTOS') {
        res.send(`
            <form action="/put/produtos" method="POST">
                <label>ID</label>
                <br>
                <input name="id" type="number" min="0">
                <br>
                <label>Nome</label>
                <br>
                <input name="nome" type="text">
                <br>
                <label>Descrição</label>
                <br>
                <input name="descricao" type="text">
                <br>
                <label>Preço</label>
                <br>
                <input name="preco" type="number" min="0">
                <br>
                <label>Categoria ID<label>
                <br>
                <input name="categoria_id" type="number" min="0">
                <br>
                <input type="submit" value="Adicionar produto">
                <br>
            </form>
        `)
    } else {
        res.send(`<h1>Tabela não encontrada</h1>`)
    }
})

// REQUESTS PARA OS MÉTODOS PUT E DELETE
app.post('/delete/categorias', async (req, res) => {
    const {id} = req.body

    const formData = {
        id: id,
    }

    await fetch(req.protocol + '://' + req.hostname + ':' + PORT + '/categorias' + '/' + id, {
        method: "DELETE",
        body: formData
    }).then(response => response.text())
    .then(response => console.log(response))
    .catch(err => console.log(err))

    res.redirect('/categorias')
})

app.post('/delete/produtos', async (req, res) => {
    const {id} = req.body

    const formData = {
        id: id
    }

    await fetch(req.protocol + '://' + req.hostname + ':' + PORT + '/produtos' + '/' + id, {
        method: "DELETE",
        body: formData
    }).then(response => response.text())
    .then(response => console.log(response))
    .catch(err => console.log(err))

    res.redirect('/produtos')
})

app.post('/put/categorias', async (req, res) => {
    const {id} = req.body
    const {nome} = req.body
    const {descricao} = req.body

    await fetch(req.protocol + '://' +req.hostname + ':' + PORT + '/categorias' + '/' + id, {
        method: "PUT",
        body: JSON.stringify({id: id, descricao: descricao, nome: nome}),
        headers: {'Content-Type': 'application/json'}
    }).then(response => response.text())
    .then(response => console.log(response))
    .catch(err => console.log(err))

    res.redirect('/categorias')
})

app.post('/put/produtos', async (req, res) => {
    const {id} = req.body
    const {nome} = req.body
    const {descricao} = req.body
    const {preco} = req.body
    const {categoria_id} = req.body

    await fetch(req.protocol + '://' + req.hostname + ':' + PORT + '/produtos' + '/' + id, {
        method: "PUT",
        body: JSON.stringify({id: id, descricao: descricao, preco: preco, categoria_id: categoria_id, nome: nome}),
        headers: {'Content-Type': 'application/json'}
    }).then(response => response.text())
    .then(response => console.log(response))
    .catch(err => console.log(err))

    res.redirect('/produtos')
})

app.listen(PORT)