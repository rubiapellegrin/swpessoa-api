const express = require('express')
const bodyparser = require('body-parser')
const cors = require('cors')
const { pool } = require('./config')

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

const getPessoas = (request, response) => {
    pool.query('select * from pessoas', (error, results) => {
        if (error) {
            return response.status(400).json({
                status: 'error',
                message: 'Erro ao recuperar os pessoas: ' + error
            })
        }
        response.status(200).json(results.rows);
    })
}

const addPessoas = (request, response) => {
    const { nome, cpf, idade } = request.body;
    pool.query(`INSERT INTO pessoas (nome, cpf, idade) 
                VALUES ($1, $2, $3) 
                RETURNING codigo, nome, cpf, idade`,
        [nome, cpf, idade],
        (error, results) => {
            if (error) {
                return response.status(400).json({
                    status: 'error',
                    message: 'Erro ao inserir pessoa! : ' + error
                })
            }
            response.status(200).json({
                status: 'success', message: 'Pessoa criado!',
                objeto: results.rows[0]
            });
        })
}

const updatePessoas = (request, response) => {
    const { codigo, nome, cpf, idade } = request.body;
    pool.query(`UPDATE pessoas set nome=$1, cpf = $2, idade = $3
                WHERE codigo = $4
                RETURNING codigo, nome, cpf, idade`,
        [nome, nome, cpf, idade],
        (error, results) => {
            if (error) {
                return response.status(400).json({
                    status: 'error',
                    message: 'Erro ao atualizar pessoa! : ' + error
                })
            }
            response.status(200).json({
                status: 'success', message: 'Pessoa atualizado!',
                objeto: results.rows[0]
            });
        })
}

const deletePessoas = (request, response) => {
    const codigo = parseInt(request.params.codigo);
    pool.query(`DELETE FROM pessoas
                WHERE codigo = $1`,
        [codigo],
        (error, results) => {
            if (error || results.rowCount == 0) {
                return response.status(400).json({
                    status: 'error',
                    message: 'Erro ao remover pessoa! : ' + (error ? error :'')
                })
            }
            response.status(200).json({
                status: 'success', message: 'Pessoa removido!'
            });
        })
}

const getPessoaPorCodigo = (request, response) => {
    const  codigo  = parseInt(request.params.codigo);
    pool.query(`SELECT * FROM pessoas
                WHERE codigo = $1`,
        [codigo],
        (error, results) => {
            if (error || results.rowCount == 0) {
                return response.status(400).json({
                    status: 'error',
                    message: 'Erro ao recuperar pessoa! : ' + (error ? error :'')
                })
            }
            response.status(200).json(results.rows[0]);
        })
}

app.route('/pessoas')
   .get(getPessoas)
   .post(addPessoas)
   .put(updatePessoas)
app.route('/pessoas/:codigo')
   .get(getPessoaPorCodigo)
   .delete(deletePessoas)

app.listen(process.env.PORT || 3002, () => {
    console.log('Servidor rodando....');
})