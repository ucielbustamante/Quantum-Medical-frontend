export function Card() {
    return(
        <div className="card" style={{width: '18rem'}}>
            <div className="card-body">
                <h5 className="card-title">Nombre apellido paciente</h5>
                <h6 className="card-subtitle mb-2 text-muted">Especialidad</h6>
                <p className="card-text">Detalles del turno</p>
                <p className="card-text">fecha</p>
                <a href="#" className="card-link">Medico</a>
            </div>
        </div>
    )
}