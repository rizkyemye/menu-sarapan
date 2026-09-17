/* ==========================================================================
   Menu Sarapan — logika bersama (halaman tamu + mode layar)
   Data dari menu.json. Bahasa: JP / EN.
   ========================================================================== */
(function (global) {
  "use strict";

  const KUNCI_BAHASA = "menu_bahasa";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function bahasaAwal() {
    let b = null;
    try { b = localStorage.getItem(KUNCI_BAHASA); } catch (e) {}
    if (b === "jp" || b === "en") return b;
    const nav = (navigator.language || "ja").toLowerCase();
    return nav.indexOf("ja") === 0 ? "jp" : "en";
  }

  function simpanBahasa(b) { try { localStorage.setItem(KUNCI_BAHASA, b); } catch (e) {} }

  function teks(obj, dasar, bhs) {
    // ambil nama_jp/nama_en, desc_jp/desc_en, dst.
    const akhiran = bhs === "en" ? "_en" : "_jp";
    const nilai = obj[dasar + akhiran];
    if (nilai !== undefined && nilai !== null && nilai !== "") return nilai;
    const lain = obj[dasar + (bhs === "en" ? "_jp" : "_en")];
    return lain == null ? "" : lain;
  }

  function namaKategori(k) { return { jp: k.nama_jp, en: k.nama_en }; }

  function tanggalHariIni() {
    const d = new Date();
    const hari = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
    return d.getFullYear() + "年" + (d.getMonth() + 1) + "月" + d.getDate() + "日（" + hari + "）";
  }

  // ---------- render halaman tamu ----------
  function renderTamu(akar, data, bhs) {
    const info = data.info || {};
    let html = "";

    html += '<header class="kepala">' +
      '<div class="hotel">' + esc(info.nama_hotel || "") + "</div>" +
      "<h1>" + (bhs === "en" ? "Breakfast Menu" : "朝食メニュー") +
      '<span class="en" style="font-size:.8rem;font-weight:400;opacity:.8"> · ' +
      (bhs === "en" ? "朝食メニュー" : "Breakfast Menu") + "</span></h1>" +
      '<div class="sub">' + esc(bhs === "en" ? (info.jam_en || info.jam) : info.jam) + "</div>" +
      '<div class="baris-info">' +
        '<span class="pil">📍 ' + esc(bhs === "en" ? (info.tempat_en || info.tempat) : info.tempat) + "</span>" +
        '<span class="pil emas">' + esc(bhs === "en" ? (info.harga_en || info.harga) : info.harga) + "</span>" +
        '<span class="pil">' + esc(data.info && data.info.update ? data.info.update : "") + " 更新</span>" +
      "</div></header>";

    html += '<div class="wadah">';

    // tanggal + catatan alergi
    html += '<div class="catatan">' + esc(tanggalHariIni()) + " ・ " +
      (bhs === "en" ? "Menu may change depending on availability." : "仕入れにより内容が変わる場合がございます。") +
      "</div>";

    (data.kategori || []).forEach(function (kat) {
      html += '<section class="kartu">';
      html += "<h2>" +
        (kat.berubah_harian ? '<span class="tanda-harian">' + (bhs === "en" ? "DAILY" : "日替わり") + "</span> " : "") +
        esc(bhs === "en" ? kat.nama_en : kat.nama_jp) +
        '<span class="en">' + esc(bhs === "en" ? kat.nama_jp : kat.nama_en) + "</span></h2>";
      if (kat.berubah_harian) {
        html += '<div class="tanggal">' + esc(tanggalHariIni()) + " のご提供</div>";
      }
      (kat.items || []).forEach(function (it) {
        const alergi = (it.alergi || []).map(function (a) {
          return '<span class="alergi">' + esc(a) + "</span>";
        }).join("");
        const tag = (it.tag || []).map(function (t) {
          return '<span class="tag' + (t === "名物" ? " emas" : "") + '">' + esc(t) + "</span>";
        }).join("");
        const ket = teks(it, "desc", bhs);
        html += '<div class="item"><div>' +
          '<div class="nama">' + esc(teks(it, "nama", bhs)) +
          '<span class="en">' + esc(teks(it, "nama", bhs === "en" ? "jp" : "en")) + "</span></div>" +
          (ket ? '<div class="keterangan">' + esc(ket) + "</div>" : "") +
          (tag ? "<div>" + tag + "</div>" : "") +
          "</div>" +
          (alergi ? '<div class="kanan">' + alergi + "</div>" : "") +
          "</div>";
      });
      html += "</section>";
    });

    // legenda alergi
    html += '<section class="kartu"><h2>' +
      (bhs === "en" ? "Allergens" : "アレルギー表示") +
      '<span class="en">' + (bhs === "en" ? "アレルギー表示" : "Allergens") + "</span></h2>" +
      '<div class="legenda">' +
      (data.alergi_legenda || []).map(function (a) {
        return "<span>" + esc(bhs === "en" ? a.en : a.kode) + "</span>";
      }).join("") + "</div>" +
      '<p style="font-size:.88rem;margin:0 0 12px">' + esc(bhs === "en" ? data.info.catatan_en : data.info.catatan) + "</p>" +
      "</section>";

    // kurasi
    if ((data.kurasi || []).length) {
      html += '<section class="kartu"><h2>' +
        (bhs === "en" ? "Dietary needs" : "食事のご相談") +
        '<span class="en">' + (bhs === "en" ? "食事のご相談" : "Dietary needs") + "</span></h2>" +
        '<div class="kurasi">' + data.kurasi.map(function (k) {
          return "<div><b>" + esc(bhs === "en" ? k.label_en : k.label_jp) + "</b>" +
                 esc(bhs === "en" ? k.isian_en : k.isian_jp) + "</div>";
        }).join("") + "</div><div style=\"height:10px\"></div></section>";
    }

    html += '<div class="kaki">' + esc(data.info.nama_hotel) + "</div>";
    html += "</div>";

    akar.innerHTML = html;
  }

  // ---------- render layar (tablet di lift) ----------
  function slideLayar(data, bhs) {
    const info = data.info || {};
    const daftar = [];

    daftar.push({
      judul: bhs === "en" ? "Breakfast Information" : "朝食のご案内",
      judul_en: bhs === "en" ? "朝食のご案内" : "Breakfast Information",
      jam: true,
      items: [
        { nama_jp: "営業時間", nama_en: "Opening hours", desc_jp: info.jam, desc_en: info.jam_en },
        { nama_jp: "場所", nama_en: "Location", desc_jp: info.tempat, desc_en: info.tempat_en },
        { nama_jp: "料金", nama_en: "Price", desc_jp: info.harga, desc_en: info.harga_en },
        { nama_jp: "ご案内", nama_en: "Note", desc_jp: info.catatan, desc_en: info.catatan_en }
      ]
    });

    (data.kategori || []).forEach(function (kat) {
      daftar.push({
        judul: bhs === "en" ? kat.nama_en : kat.nama_jp,
        judul_en: bhs === "en" ? kat.nama_jp : kat.nama_en,
        harian: kat.berubah_harian,
        items: kat.items || []
      });
    });

    daftar.push({
      judul: bhs === "en" ? "Allergens" : "アレルギー表示",
      judul_en: bhs === "en" ? "アレルギー表示" : "Allergens",
      alergi: true
    });

    return daftar;
  }

  function renderSlide(akar, slide, data, bhs) {
    const info = data.info || {};
    let html = '<div class="layar-atas">' +
      '<div class="hotel-name">' + esc(info.nama_hotel || "") + "</div>" +
      '<div class="jam">' + esc(bhs === "en" ? info.jam_en : info.jam) + "</div>" +
      "</div>";

    html += '<div class="layar-judul">' +
      (slide.harian ? '<span class="tanda-harian">' + (bhs === "en" ? "DAILY" : "日替わり") + "</span> " : "") +
      esc(slide.judul) + '<span class="en">' + esc(slide.judul_en) + "</span></div>";

    if (slide.alergi) {
      html += '<div class="layar-isi" style="grid-template-columns:repeat(auto-fit,minmax(190px,1fr))">' +
        (data.alergi_legenda || []).map(function (a) {
          return '<div class="kotak-item"><div class="nm">' + esc(bhs === "en" ? a.en : a.kode) + "</div></div>";
        }).join("") + "</div>";
      html += '<div class="layar-bawah"><div>' + esc(bhs === "en" ? data.info.catatan_en : data.info.catatan) + "</div></div>";
    } else {
      html += '<div class="layar-isi">' + (slide.items || []).map(function (it) {
        const alergi = (it.alergi || []).map(function (a) {
          return '<span class="alergi">' + esc(a) + "</span>";
        }).join("");
        const ket = teks(it, "desc", bhs);
        return '<div class="kotak-item">' +
          '<div class="nm">' + esc(teks(it, "nama", bhs)) + "</div>" +
          '<div class="en">' + esc(teks(it, "nama", bhs === "en" ? "jp" : "en")) + "</div>" +
          (ket ? '<div class="en">' + esc(ket) + "</div>" : "") +
          (alergi ? "<div>" + alergi + "</div>" : "") +
          "</div>";
      }).join("") + "</div>";
      html += '<div class="layar-bawah"><div>' +
        esc(bhs === "en" ? "Please ask our staff for details." : "詳しくはスタッフまでお尋ねください。") +
        "</div></div>";
    }
    akar.innerHTML = html;
  }

  global.MenuSarapan = {
    esc: esc,
    bahasaAwal: bahasaAwal,
    simpanBahasa: simpanBahasa,
    teks: teks,
    tanggalHariIni: tanggalHariIni,
    renderTamu: renderTamu,
    slideLayar: slideLayar,
    renderSlide: renderSlide,
    muat: function (url) {
      return fetch(url || ("menu.json?v=" + new Date().toISOString().slice(0, 10)))
        .then(function (r) { return r.ok ? r.json() : null; });
    }
  };
})(window);
