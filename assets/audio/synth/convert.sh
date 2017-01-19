for i in *.wav ; do 
    ffmpeg -i "$i" -vf volume="6.0dB" -q:a 9 -acodec libmp3lame -y $(basename "${i/.wav}_92").mp3 
    ffmpeg -i "$i" -vf volume="6.0dB" -q:a 9 -y $(basename "${i/.wav}_92").ogg 
done