const getPublicIP = async () => {
    const response = await fetch("https://api.ipify.org");
    if (!response.ok) {
        console.log(`getPublicIP error! status: ${response.status}`);
        return ""
    }
    return await response.text();
}

export { getPublicIP };
