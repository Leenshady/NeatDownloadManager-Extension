function renderList(blockedHosts) {
    const listElement = document.getElementById('blocked-list');
    listElement.innerHTML = '';

    if (!blockedHosts || blockedHosts.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'empty-message';
        emptyMsg.textContent = 'No websites blocked.';
        listElement.appendChild(emptyMsg);
        return;
    }

    blockedHosts.forEach(host => {
        const li = document.createElement('li');
        const textSpan = document.createElement('span');
        textSpan.textContent = host;

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.textContent = 'Remove';
        removeBtn.onclick = () => {
            removeHost(host);
        };

        li.appendChild(textSpan);
        li.appendChild(removeBtn);
        listElement.appendChild(li);
    });
}

function addHost() {
    const input = document.getElementById('new-host');
    let host = input.value.trim();
    if (!host) return;

    // Simple cleanup: remove protocol if pasted
    try {
        if (host.includes('://')) {
            host = new URL(host).hostname;
        }
    } catch (e) {
        // keep as is if URL parsing fails but might be a domain
    }

    chrome.storage.local.get(['blockedHosts'], function (result) {
        let blockedHosts = result.blockedHosts || [];
        if (!blockedHosts.includes(host)) {
            blockedHosts.push(host);
            chrome.storage.local.set({ blockedHosts: blockedHosts }, function () {
                renderList(blockedHosts);
                input.value = '';
            });
        } else {
            alert('Website is already blocked.');
            input.value = '';
        }
    });
}

function removeHost(hostToRemove) {
    chrome.storage.local.get(['blockedHosts'], function (result) {
        let blockedHosts = result.blockedHosts || [];
        blockedHosts = blockedHosts.filter(host => host !== hostToRemove);
        chrome.storage.local.set({ blockedHosts: blockedHosts }, function () {
            renderList(blockedHosts);
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get(['blockedHosts'], function (result) {
        renderList(result.blockedHosts || []);
    });

    document.getElementById('add-btn').addEventListener('click', addHost);
    document.getElementById('new-host').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') addHost();
    });
});
