from pytube import YouTube
import sys
import json

def download_video(url, output_path):
    try:
        # Configura o YouTube object
        yt = YouTube(url)
        
        # Pega a melhor stream com vídeo e áudio
        stream = yt.streams.filter(progressive=True, file_extension='mp4').order_by('resolution').desc().first()
        
        if not stream:
            # Se não encontrar stream progressiva, tenta pegar a melhor qualidade de vídeo
            stream = yt.streams.filter(file_extension='mp4').order_by('resolution').desc().first()
        
        if not stream:
            raise Exception("Nenhuma stream de vídeo encontrada")
            
        # Faz o download
        stream.download(filename=output_path)
        
        # Retorna sucesso
        print(json.dumps({
            "success": True,
            "message": "Download concluído com sucesso"
        }))
        
    except Exception as e:
        # Retorna erro
        print(json.dumps({
            "success": False,
            "error": str(e)
        }))
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(json.dumps({
            "success": False,
            "error": "Argumentos inválidos. Use: python youtubeDownloader.py <url> <output_path>"
        }))
        sys.exit(1)
        
    url = sys.argv[1]
    output_path = sys.argv[2]
    download_video(url, output_path) 