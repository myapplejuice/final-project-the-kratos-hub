import { useContext, useState } from 'react'
import * as styles from "../index.css";
import APIService from '../utils/api-service';
import { AppContext } from '../utils/app-context';
import { Navigate, useNavigate } from 'react-router-dom';
import { routes } from '../utils/constants';

export default function Gate() {
    const { admin, setAdmin } = useContext(AppContext);
    const [id, setId] = useState('');
    const [pass, setPass] = useState('');
    const nav = useNavigate();

    async function handleAccessRequest() {
        const result = await APIService.routes.access({ id, pass });
        if (result.success) {
            const admin = result.data.admin;
            const token = result.data.token;

            setAdmin(admin);
            APIService.setAdmin(token, admin.accessId);
            await APIService.routes.testToken();
            nav(routes.dashboard);
        } else {
            alert(result.message);
        }
    }

    return (
        <div className="gate-page">
            <div className="gate-box">
                <h2 className="gate-title">Kratos Hub Dashboard</h2>
                <p className="gate-subtitle">Enter your admin credentials to continue</p>

                <div className="gate-input-group">
                    <label htmlFor="id">ID</label>
                    <input
                        id="id"
                        placeholder="XXXXXX"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                    />
                </div>

                <div className="gate-input-group">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={pass}
                        onChange={(e) => setPass(e.target.value)}
                    />
                </div>

                <button onClick={handleAccessRequest} className="gate-btn">
                    Submit
                </button>

                <div className="gate-footer">
                    <p>
                        NOTE: If you forgot your credentials, contact your head of unit to reset them.
                    </p>
                </div>
            </div>
        </div>

    );
}
