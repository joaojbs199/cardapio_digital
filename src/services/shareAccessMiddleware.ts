import html2canvas from "html2canvas";

export const exportElementAsImage = async (element, fileName) => {
    const canvas = await html2canvas(element);
    const image = canvas.toDataURL("image/png", 1.0);
    downloadImage(image, fileName);
}

const downloadImage = (blob, fileName) => {
    const fakeLink = document.createElement('a');
    fakeLink.style.display = "none";
    fakeLink.download = fileName;
    fakeLink.href = blob;
    document.body.appendChild(fakeLink);
    fakeLink.click();
    document.body.removeChild(fakeLink);
    fakeLink.remove();
}

export const shareLink = (link) => {
        
    if(navigator.share) {

        navigator.share({
            title: "Easy menu - Cardápio digital%0a%0a",
            text: "Este é o link do nosso cardápio! Acesse e confira nossas opções.%0a%0a",
            url: link
        });
    } else {
        navigator.clipboard.writeText(link).then(() => alert("Copiado para a área de transferência"));
    }
}

export const openCardapio = (link) => {
    const cardapioUrl = link;
    const openTag = document.createElement('a');
    openTag.href = cardapioUrl;
    openTag.target = '_blank';
    document.body.appendChild(openTag);
    openTag.click();
    document.body.removeChild(openTag);
}