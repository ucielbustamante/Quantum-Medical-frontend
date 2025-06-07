import { useState } from "react"
import { FormGenerico } from "../components/formGenerico"
import { PageAdmin } from "../components/pageAdmin"
import { apiRequest } from "../services/apiConection" 

export function NewUser() {
  const [name, setName] = useState("")
  const [lastname, setLastname] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [dni, setDni] = useState("")
  const [role, setRole] = useState("")
  const [mensaje, setMensaje] = useState("")

  const campos = [
    { label: "Nombre", type: "text", name: "name", value: name, onChange: (e) => setName(e.target.value) },
    { label: "Apellido", type: "text", name: "lastname", value: lastname, onChange: (e) => setLastname(e.target.value) },
    { label: "Email", type: "email", name: "email", value: email, onChange: (e) => setEmail(e.target.value) },
    { label: "Contraseña", type: "password", name: "password", value: password, onChange: (e) => setPassword(e.target.value) },
    { label: "DNI", type: "text", name: "dni", value: dni, onChange: (e) => setDni(e.target.value) },
    {
      label: "Rol",
      type: "select",
      name: "role",
      value: role,
      onChange: (e) => setRole(e.target.value),
      opciones: ["Admin", "Doctor", "Patient"]
    }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()

    const token = localStorage.getItem("token")

    try {
      await apiRequest("/users", "POST", {
        name,
        lastname,
        email,
        password,
        dni,
        role
      }, token)

      setMensaje("Usuario creado exitosamente")
      setName("")
      setLastname("")
      setEmail("")
      setPassword("")
      setDni("")
      setRole("")
    } catch (error) {
      console.error(error)
      setMensaje(error.message || "Error al crear usuario")
    }
  }

  return (
    <PageAdmin>
      <div className="container mt-4">
        <FormGenerico
          titulo="Crear Nuevo Usuario"
          campos={campos}
          onSubmit={handleSubmit}
        />
        {mensaje && <p className="mt-3">{mensaje}</p>}
      </div>
    </PageAdmin>
  )
}
