document.addEventListener('DOMContentLoaded', () => {
    const dbName = 'mahasiswaDB';
    const dbVersion = 1;
    let db;

    const dataForm = document.getElementById('data-form');
    const nimInput = document.getElementById('nim');
    const namaInput = document.getElementById('nama');
    const dataContainer = document.getElementById('data-container');

    // Buka atau buat database IndexedDB
    const request = indexedDB.open(dbName, dbVersion);

    request.onerror = function(event) {
        console.error('Error opening database');
    };

    request.onsuccess = function(event) {
        db = event.target.result;
        tampilkanData();
    };

    request.onupgradeneeded = function(event) {
        db = event.target.result;
        const objectStore = db.createObjectStore('mahasiswa', { keyPath: 'nim' });
        objectStore.createIndex('nama', 'nama', { unique: false });
    };

    // Simpan data
    dataForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const nim = nimInput.value;
        const nama = namaInput.value;
        tambahData(nim, nama);
        dataForm.reset();
    });

    function tambahData(nim, nama) {
        const transaction = db.transaction(['mahasiswa'], 'readwrite');
        const objectStore = transaction.objectStore('mahasiswa');
        const data = { nim, nama };
        const request = objectStore.add(data);
        request.onsuccess = tampilkanData;
    }

    // Tampilkan data
    function tampilkanData() {
        dataContainer.innerHTML = '';

        const objectStore = db.transaction('mahasiswa').objectStore('mahasiswa');
        objectStore.openCursor().onsuccess = function(event) {
            const cursor = event.target.result;
            if (cursor) {
                const data = cursor.value;
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${data.nim}</td>
                    <td>${data.nama}</td>
                    <td><button class="btn btn-primary" onclick="editData('${data.nim}')">Edit</button></td>
                    <td><button class="btn btn-danger" onclick="hapusData('${data.nim}')">Hapus</button></td>
                `;
                dataContainer.appendChild(row);
                cursor.continue();
            }
        };
    }

    // Edit data
    window.editData = function(nim) {
        const transaction = db.transaction(['mahasiswa'], 'readwrite');
        const objectStore = transaction.objectStore('mahasiswa');
        const request = objectStore.get(nim);
        request.onsuccess = function(event) {
            const data = event.target.result;
            nimInput.value = data.nim;
            namaInput.value = data.nama;
            hapusData(nim);
        };
    };

    // Hapus data
    window.hapusData = function(nim) {
        const transaction = db.transaction(['mahasiswa'], 'readwrite');
        const objectStore = transaction.objectStore('mahasiswa');
        objectStore.delete(nim);
        tampilkanData();
    };
});
