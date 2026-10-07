import { CONFIG } from "./config.js";

/**
 * Tes GET biasa. Jika browser memblokir pembacaan respons karena CORS,
 * gunakan URL /exec langsung di browser untuk memastikan endpoint aktif.
 */
export async function testConnection(){
  if(!CONFIG.GAS_URL){
    return {success:false,message:"GAS_URL belum diisi di js/config.js"};
  }

  try{
    const res = await fetch(`${CONFIG.GAS_URL}?action=status&t=${Date.now()}`, {
      method:"GET",
      cache:"no-store",
      redirect:"follow"
    });

    const text = await res.text();

    try{
      return JSON.parse(text);
    }catch{
      return {
        success:false,
        corsLikely:true,
        message:"Endpoint merespons, tetapi browser tidak menerima JSON. Buka URL /exec langsung untuk verifikasi."
      };
    }
  }catch(e){
    return {
      success:false,
      corsLikely:true,
      message:"Browser memblokir pembacaan respons Apps Script. Ini umum pada GitHub Pages. Gunakan Tes Simpan atau buka URL /exec langsung."
    };
  }
}

/**
 * Penyimpanan progress memakai mode no-cors.
 * Browser tidak bisa membaca response, tetapi POST tetap dikirim ke Apps Script.
 */
export async function pushProgress(state){
  if(!CONFIG.GAS_URL){
    return {success:false,message:"GAS_URL belum diatur"};
  }

  const payload = {
    action:"saveProgress",
    data:{
      student:state.student,
      modules:state.modules,
      xp:state.xp,
      badges:state.badges,
      quiz:state.quiz,
      appVersion:CONFIG.APP_VERSION
    }
  };

  try{
    await fetch(CONFIG.GAS_URL, {
      method:"POST",
      mode:"no-cors",
      cache:"no-store",
      body:JSON.stringify(payload)
    });

    // Opaque response memang tidak bisa dibaca pada mode no-cors.
    return {
      success:true,
      opaque:true,
      message:"Request sinkronisasi telah dikirim ke Google Apps Script."
    };
  }catch(e){
    return {
      success:false,
      message:`Request tidak dapat dikirim: ${e.message}`
    };
  }
}

/**
 * Untuk GitHub Pages, sinkronisasi cloud bersifat write-through.
 * Pembacaan cloud dinonaktifkan secara default karena keterbatasan CORS GAS.
 * localStorage tetap menjadi sumber state utama di browser.
 */
export async function pullProgress(studentId){
  return null;
}
