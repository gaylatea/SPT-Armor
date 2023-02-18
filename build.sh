rm -f Gaylatea-Armor.zip

(cd Server; npm run build)
(cd Client; dotnet build)

zip -j Server/dist/Gaylatea-Armor.zip Client/bin/Debug/net472/Gaylatea-Armor.dll
mv Server/dist/Gaylatea-Armor.zip ./