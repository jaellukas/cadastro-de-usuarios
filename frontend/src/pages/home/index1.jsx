import { useEffect, useState, useRef } from 'react'
import './style.css'
import Trash from '../../assets/trash.svg'
import api from '../../services/api'

function Home() {
  const [users, setUsers] = useState([])

  const inputName = useRef()
  const inputIdade = useRef()
  const inputEmail = useRef()

  //carregar usuarios do banco de dados
  async function getUsers() {
    const usersFromapi = await api.get('/usuarios')
    setUsers(usersFromapi.data)
  }

  useEffect(() => {
    getUsers()
  }, [])

  //criar usuarios
  async function creatUsers() {
    await api.post('/usuarios', {
      name: inputName.current.value,
      age: inputIdade.current.value,
      email: inputEmail.current.value
    })
    getUsers()
  }

  async function deleteUsers(id) {
    await api.delete(`/usuarios/${id}`)
    getUsers()
  }
  useEffect(() => {
    getUsers()
  }, [])

  return (
    <div className='container'>
      <form>
        <h1>cadstro de usuario</h1>
        <input name='nome' type='text' placeholder='nome' ref={inputName} />
        <input name='idade' type='number' placeholder='idade' ref={inputIdade} />
        <input name='email' type='text' placeholder='email' ref={inputEmail} />
        <button type='button' onClick={creatUsers}>cadastrar</button>
      </form>
      {users.map(user => (

        <div key={user.id} className='card'>
          <div>
            <p>Nome: <span>{user.name}</span></p>
            <p>Idade: <span>{user.age}</span></p>
            <p>Email: <span>{user.email}</span></p>
          </div>
          <button onClick={() => deleteUsers(user.id)}>
            <img src={Trash} alt="lixeira" />
          </button>
        </div>

      ))}

    </div>
  )

}
export default Home
