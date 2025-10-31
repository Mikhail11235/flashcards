class TokenStorage {
    constructor(accessKey = "accessToken", refreshKey = "refreshToken") {
        this.accessKey = accessKey;
        this.refreshKey = refreshKey;
    }

    get access() {
        return localStorage.getItem(this.accessKey);
    }

    get refresh() {
        return localStorage.getItem(this.refreshKey);
    }

    set({ access, refresh }) {
        localStorage.setItem(this.accessKey, access);
        localStorage.setItem(this.refreshKey, refresh);
    }

    clear() {
        localStorage.removeItem(this.accessKey);
        localStorage.removeItem(this.refreshKey);
    }

    isTokenExpired(token) {
        if (!token) return true;
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return Date.now() >= payload.exp * 1000;
        } catch (err) {
            console.error("isTokenExpired error");
            return true;
        }
    }
}

export const tokenStorage = new TokenStorage();
