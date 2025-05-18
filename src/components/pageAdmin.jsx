import {Nav} from './Nav';

export function PageAdmin({children}){
    return(
        <div className="d-flex flex-column" style={{ 
           minHeight: "100vh", 
           background: "linear-gradient(180deg, #004257 0%, #006994 100%)"
         }}>
            <Nav/>
            <div className="flex-grow-1">{children}</div>
        </div>

    )
}