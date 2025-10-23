import { useContext, useState } from 'react'
import * as styles from "../index.css";
import APIService from '../utils/api-service';
import { Navigate, useNavigate } from 'react-router-dom';
import { routes } from '../utils/constants';
import LoadingSpinner from '../comps/loading-spinner';
import Alert from '../comps/alert';
import { usePopups } from '../utils/popups.provider';
import SessionStorageSerivce from '../utils/session-storage-service';

export default function Gate() {
    const { showDialog, showSpinner, hideSpinner } = usePopups();
    const nav = useNavigate();

    const [id, setId] = useState('');
    const [pass, setPass] = useState('');

    async function handleAccessRequest() {
        try {
            showSpinner();
            const result = await APIService.routes.access({ id, pass });
            if (result.success) {
                const admin = result.data.admin;
                const token = result.data.token;

                SessionStorageSerivce.setItem('admin', { admin, token });
                nav(routes.dashboard);
            } else {
                showDialog({
                    title: "Failure",
                    content: <p>Invalid credentials!</p>,
                    actions: [
                        { label: "Ok", onClick: () => { }, color: "#cc2e2eff" },
                    ],
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            hideSpinner();
        }
    }

    const existingAdmin = SessionStorageSerivce.getItem('admin');
    if (existingAdmin) return <Navigate to={routes.dashboard} replace />;

    return (
        <>
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
        </>
    );
}
