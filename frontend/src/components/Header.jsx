import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useTranslation } from 'react-i18next';


function Header() {
    const { user, loading, isAuthenticated, logout } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleLoginClick = () => {
        if (isAuthenticated) {
            logout();
            navigate("/");
        } else {
            navigate("/login");
        }
    };

    const asciArt = `░▒▓████████▓▒░▒▓█▓▒░       ░▒▓██████▓▒░ ░▒▓███████▓▒░▒▓█▓▒░░▒▓█▓▒░
░▒▓█▓▒░      ░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░
░▒▓█▓▒░      ░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░
░▒▓██████▓▒░ ░▒▓█▓▒░      ░▒▓████████▓▒░░▒▓██████▓▒░░▒▓████████▓▒░
░▒▓█▓▒░      ░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░
░▒▓█▓▒░      ░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░
░▒▓█▓▒░      ░▒▓████████▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓███████▓▒░░▒▓█▓▒░░▒▓█▓▒░`;

    if (loading) {
        return (
            <div className="header">
                <div className="logo-container">
                    <span className="logo asciart">{asciArt}</span>
                </div>
                <table>
                    <colgroup>
                        <col style={{ width: "60px" }} />
                        <col />
                        <col style={{ width: "60px" }} />
                    </colgroup>
                    <tbody>
                        <tr>
                            <td colSpan={2}>{t('app_description')}</td>
                            <td style={{ textAlign: "center" }}>v1.0.0</td>
                        </tr>
                        <tr>
                            <td>{t('user')}</td>
                            <td>{t('loading')}</td>
                            <td
                                className="button-cel"
                                style={{ textAlign: "center" }}
                            >
                                ...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }

    return (
        <div className="header">
            <div className="logo-container">
                <span className="logo asciart">{asciArt}</span>
            </div>
            <table style={{ tableLayout: "unset" }}>
                <colgroup>
                    <col style={{ width: "60px" }} />
                    <col style={{ minWidth: "170px" }}/>
                    <col style={{ width: "60px" }} />
                </colgroup>
                <tbody>
                    <tr>
                        <td colSpan={2}>{t('app_description')}</td>
                        <td style={{ textAlign: "center" }}>v1.0.0</td>
                    </tr>
                    <tr>
                        <td>{t('user')}</td>
                        <td>{isAuthenticated ? user.username : "guest"}</td>
                        <td
                            className="button-cel"
                            style={{ textAlign: "center" }}
                            onClick={handleLoginClick}
                        >
                            {isAuthenticated ? t('logout') : t('login')}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default Header;