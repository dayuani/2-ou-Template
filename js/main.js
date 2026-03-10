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
  if (!commentList) return; // Keamanan jika elemen belum ada

  const { data, error } = await db
    .from("comments")
    .select("*")
    .order("created_at", { ascending: false }); // Terbaru di atas

  if (error) {
    console.error("Gagal mengambil data:", error);
    commentList.innerHTML = `<p class="text-red-400 text-center text-xs">Gagal memuat pesan.</p>`;
    return;
  }

  // Bersihkan loading state
  commentList.innerHTML = "";

  if (data && data.length > 0) {
    data.forEach((comment) => {
      renderComment(comment);
    });
  } else {
    commentList.innerHTML = `<p class="text-center text-gray-400 text-sm py-10">Belum ada ucapan. Jadilah yang pertama!</p>`;
  }
}

// ===== FUNGSI RENDER KE HTML =====
function renderComment(data) {
  const list = document.getElementById("commentList");
  if (!list) return;

  const div = document.createElement("div");
  div.className = "p-5 rounded-2xl bg-gray-50 border border-gray-100 shadow-sm mb-4 animate-fade-in";

  div.innerHTML = `
    <div class="flex justify-between items-center mb-3">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-full bg-[#1C0770]/10 flex items-center justify-center text-[#1C0770] text-xs font-bold">
          ${data.name ? data.name.charAt(0).toUpperCase() : "?"}
        </div>
        <h4 class="font-bold text-[#1C0770] text-sm">${data.name}</h4>
      </div>
      <span class="text-[10px] font-bold uppercase tracking-wider bg-white px-3 py-1 rounded-full border border-gray-100 text-gray-400">
        ${data.attendance}
      </span>
    </div>
    <p class="text-sm text-gray-600 leading-relaxed italic ml-10">"${data.message}"</p>
    <div class="mt-3 ml-10 flex items-center gap-2 text-[10px] text-gray-400">
       <i class="fa-regular fa-clock"></i>
       <span>${data.time || "Baru saja"}</span>
    </div>
  `;

  // GUNAKAN appendChild
  // Karena data pertama dari data.forEach sudah yang paling baru (hasil order ascending: false)
  list.appendChild(div);
}

// ===== FUNGSI TAMBAH DATA =====
async function addWish(event) {
  event.preventDefault();

  const submitBtn = event.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> Mengirim...';

  const name = document.getElementById("name").value;
  const message = document.getElementById("message").value;
  const attendance = document.querySelector('input[name="attendance"]:checked')?.value || "Hadir";

  // Kita buat objek data lokal untuk render instan
  const commentData = { 
    name, 
    message, 
    attendance, 
    time: "Baru saja" // Label sementara sebelum di-refresh dari DB
  };

  const { error } = await db
    .from("comments")
    .insert([{ name, message, attendance }]);

  if (error) {
    alert("Gagal mengirim: " + error.message);
  } else {
    event.target.reset();
    
    // OPSI 1: Render manual ke posisi paling atas (Instan)
    renderCommentAtTop(commentData); 
    
    // OPSI 2: Tetap panggil loadComments untuk sinkronisasi waktu asli dari DB
    // await loadComments(); 
  }

  submitBtn.disabled = false;
  submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Kirim Ucapan';
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
