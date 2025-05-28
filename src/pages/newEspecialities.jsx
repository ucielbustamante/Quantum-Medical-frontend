import { useState } from "react"
import { apiRequest } from "../services/apiConection";
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
                const data = await apiRequest("/specialties", "POST", { name }, token);

                setMensaje(`Especialidad creada: ${data?.data?.name}`);
                setName("");
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
