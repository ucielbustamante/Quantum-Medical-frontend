import { useState } from "react"
import { FormGenerico } from "../components/formGenerico"
import { PageAdmin } from "../components/pageAdmin"

export function NewEspecialty() {
    const [name, setName] = useState("")
    const [mensaje, setMensaje] = useState("")

    const campos = [
        {
            label: "Nombre de la especialidad",
            type: "text",
            name: "name",
            value: name,
            onChange: (e) => setName(e.target.value)
        }
    ]

    const handleSubmit = async (e) => {
            e.preventDefault();

            const token = localStorage.getItem("token");

            try {
                const res = await fetch("http://localhost:5000/api/specialties", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ name })
                });

                const data = await res.json();

                if (res.ok) {
                    setMensaje(`Especialidad creada: ${data?.data?.name}`);
                    setName("");
                } else {
                    setMensaje(data?.data?.message || "Error al crear especialidad");
                }
            } catch (err) {
                console.error(err);
                setMensaje("Error al conectar con el servidor");
            }
        };


    return (
        <PageAdmin>
            <div className="container mt-4">
                <FormGenerico
                    titulo="Agregar Nueva Especialidad"
                    campos={campos}
                    onSubmit={handleSubmit}
                />
                {mensaje && <p className="mt-3">{mensaje}</p>}
            </div>
        </PageAdmin>
    )
}
