// ===== GLOBAL =====
const music = document.getElementById("bg-music");
const toggle = document.getElementById("musicToggle");
const openBtn = document.getElementById("openInvitation");
const cover = document.getElementById("cover");
const invitation = document.getElementById("invitation-content");

let isPlaying = false;
// ===== MUSIC =====
toggle.innerHTML = '<i class="fa-solid fa-play"></i>';

toggle.addEventListener("click", () => {
  if (!isPlaying) {
    music.play();
    toggle.innerHTML = '<i class="fa-solid fa-pause"></i>';
    isPlaying = true;
  } else {
    music.pause();
    toggle.innerHTML = '<i class="fa-solid fa-play"></i>';
    isPlaying = false;
  }
});

// ===== OPEN INVITATION =====
openBtn.addEventListener("click", () => {
  cover.classList.add("opacity-0", "pointer-events-none");

  setTimeout(() => {
    cover.classList.add("hidden");
    invitation.classList.remove("hidden");
    AOS.refresh();
  }, 700);

  music.play().catch(() => {});
  toggle.innerHTML = '<i class="fa-solid fa-pause"></i>';
  isPlaying = true;

  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ===== COUT INVITATION =====

const countdownDate = new Date("2027-09-08T00:00:00").getTime();

function updateCountdown() {
  const now = new Date().getTime();
  const distance = countdownDate - now;

  if (distance < 0) return;

  document.getElementById("days").innerText = Math.floor(
    distance / (1000 * 60 * 60 * 24),
  );

  document.getElementById("hours").innerText = Math.floor(
    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );

  document.getElementById("minutes").innerText = Math.floor(
    (distance % (1000 * 60 * 60)) / (1000 * 60),
  );

  document.getElementById("seconds").innerText = Math.floor(
    (distance % (1000 * 60)) / 1000,
  );
}

updateCountdown();
setInterval(updateCountdown, 1000);
// Fungsi Buka/Tutup Modal
function toggleModal(id) {
  const modal = document.getElementById(id);
  if (modal.classList.contains("hidden")) {
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden"; // Kunci scroll saat modal buka
  } else {
    modal.classList.add("hidden");
    document.body.style.overflow = "auto"; // Aktifkan scroll kembali
  }
}

// Fungsi Salin Nomor Rekening
function copyText(elementId) {
  const text = document.getElementById(elementId).innerText;
  navigator.clipboard.writeText(text).then(() => {
    alert("Nomor Rekening berhasil disalin: " + text);
  });
}

// ===== KONFIGURASI SUPABASE =====
const SUPABASE_URL = "https://osytfkzawpftsktljurs.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_HK7k7M1TH9uWsnycuXZTmQ_5b-vsm1d";

// Inisialisasi client
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===== FUNGSI LOAD DATA =====
async function loadComments() {
  const commentList = document.getElementById("commentList");
  if (!commentList) return;

  const { data, error } = await db
    .from("comments")
    .select("*")
    .order("created_at", { ascending: false }); // Ambil terbaru dari database

  if (error) {
    console.error("Gagal mengambil data:", error);
    return;
  }

  commentList.innerHTML = ""; // Bersihkan list

  if (data && data.length > 0) {
    data.forEach((comment) => {
      // Gunakan fungsi render biasa
      renderComment(comment); 
    });
  }
}

// ===== FUNGSI RENDER KE HTML =====
function renderComment(data) {
  const list = document.getElementById("commentList");
  if (!list) return;

  const div = document.createElement("div");
  div.className = "p-5 rounded-2xl bg-gray-50 border border-gray-100 shadow-sm mb-4";

  div.innerHTML = `
    <div class="flex justify-between items-center mb-3">
      <div class="flex items-center gap-2">
        <h4 class="font-bold text-[#1C0770] text-sm">${data.name}</h4>
      </div>
      <span class="text-[10px] bg-white px-3 py-1 rounded-full border text-gray-400">
        ${data.attendance}
      </span>
    </div>
    <p class="text-sm text-gray-600 italic ml-10">"${data.message}"</p>
  `;

  // PAKAI appendChild karena data dari loadComments sudah urut terbaru -> terlama
  list.appendChild(div); 
}

// ===== FUNGSI TAMBAH DATA =====
async function addWish(event) {
  event.preventDefault();
  // ... (ambil data name, message, attendance) ...

  const { error } = await db
    .from("comments")
    .insert([{ name, message, attendance }]);

  if (!error) {
    event.target.reset();

    // BUAT ELEMEN BARU SECARA INSTAN
    const list = document.getElementById("commentList");
    const newDiv = document.createElement("div");
    newDiv.className = "p-5 rounded-2xl bg-gray-50 border border-gray-100 shadow-sm mb-4 animate-fade-in";
    newDiv.innerHTML = `
        <div class="flex justify-between items-center mb-3">
          <h4 class="font-bold text-[#1C0770] text-sm">${name}</h4>
          <span class="text-[10px] bg-white px-3 py-1 rounded-full border text-gray-400">${attendance}</span>
        </div>
        <p class="text-sm text-gray-600 italic ml-10">"${message}"</p>
    `;

    // PAKAI prepend DI SINI agar langsung muncul di paling atas layar user
    list.prepend(newDiv); 
    
    // Opsional: jalankan loadComments setelah beberapa saat untuk sinkronisasi waktu asli
    // setTimeout(loadComments, 2000);
  }
}

// Fungsi pembantu agar bisa menaruh di atas khusus saat input baru
function renderCommentAtTop(data) {
  const list = document.getElementById("commentList");
  if (!list) return;

  // Hapus pesan "Belum ada ucapan" jika ini komentar pertama
  if (list.innerText.includes("Belum ada ucapan")) {
      list.innerHTML = "";
  }

  renderComment(data); // Memanggil fungsi render yang sudah kamu buat
}

// Pastikan dipanggil setelah semua HTML siap
document.addEventListener("DOMContentLoaded", () => {
  loadComments();
});
