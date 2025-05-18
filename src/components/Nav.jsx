import { Link } from "react-router-dom"

export function Nav () {
    return (
       <nav className="navbar row" style={{
            background: 'linear-gradient(180deg,rgb(1, 52, 68) 0%,rgb(2, 97, 135) 100%)',
            color: 'white',
            fontSize: '20px'
        }}>
            <ul className="nav justify-content-end w-100">
                <li className="nav-item mx-3">
                <Link to="/turnos" className="nav-link  text-white">Turnos</Link>
                </li>
                <li className="nav-item mx-3">
                <Link to="/medicos" className="nav-link text-white">Médicos</Link>
                </li>
                <li className="nav-item mx-3">Especialidad
                {/* <Link to="/especialidad" className="nav-link">Especialidad</Link> */}
                </li>
                <li className="nav-item mx-3">
                    Cerrar sesion
                </li>
            </ul>
        </nav>

    )
}