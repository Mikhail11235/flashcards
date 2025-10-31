function Footer() {
    const asciArt = `
 ▄▄▄·      .▄▄ · ▄▄▄ . ▌ ▐·▪   ▐ ▄     • ▌ ▄ ·. ▪  ▄ •▄  ▄ .▄ ▄▄▄· ▪  ▄▄▌
▐█ ▄█▪     ▐█ ▀. ▀▄.▀·▪█·█▌██ •█▌▐█    ·██ ▐███▪██ █▌▄▌▪██▪▐█▐█ ▀█ ██ ██•
 ██▀· ▄█▀▄ ▄▀▀▀█▄▐▀▀▪▄▐█▐█•▐█·▐█▐▐▌    ▐█ ▌▐▌▐█·▐█·▐▀▀▄·██▀▐█▄█▀▀█ ▐█·██▪
▐█▪·•▐█▌.▐▌▐█▄▪▐█▐█▄▄▌ ███ ▐█▌██▐█▌    ██ ██▌▐█▌▐█▌▐█.█▌██▌▐▀▐█ ▪▐▌▐█▌▐█▌▐▌
.▀    ▀█▄▀▪ ▀▀▀▀  ▀▀▀ . ▀  ▀▀▀▀▀ █▪    ▀▀  █▪▀▀▀▀▀▀·▀  ▀▀▀▀ · ▀  ▀ ▀▀▀.▀▀▀ `;

    return (
        <div className="footer">
            <div className="sign-container">
                <a href="mailto:posevin.mikhail@gmail.com"><span className="sign asciart">{asciArt}</span></a>
            </div>
        </div>
    );
}

export default Footer;