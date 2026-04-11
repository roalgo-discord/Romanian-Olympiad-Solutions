\## Ce trebuie să calculăm?  


Alex scoate, fără înlocuire, K șosete dintr-un sertar în care fiecare șosetă are o culoare (numere de la 1 la N) și o dimensiune – mică (size = 0) sau mare (size = 1).



Toate șosetele mici au aceeași greutate sizeSmall, toate cele mari au greutatea sizeBig. În fiecare pas, șansele ca o anumită șosetă să fie aleasă sunt proporționale cu greutatea ei.



După ce a luat cele K șosete, Alex vrea să ştie probabilitatea ca cel puţin două dintre ele să aibă aceeaşi culoare (dimensiunea nu contează).



Se cere răspunsul cu eroare absolută ≤ $10^{-5}$.



\---



\## Ideea principală



Evenimentul „există cel puţin o pereche de şosete de aceeaşi culoare” este complementul evenimentului „toate şosetele alese au culori diferite”.



`P\_{cel puţin două egale} = 1 - P\_{toate diferite}.`



Așadar trebuie să calculăm probabilitatea ca, în cele K alegeri, să nu se repete nicio culoare.



Greutatea depinde numai de dimensiune, nu de culoare. Din acest motiv procesul poate fi descompus în două părţi independente:



1\. Câte şosete mici și câte mari sunt luate?  

&#x20;  Dacă notăm cu $a$ numărul de mici și cu $b = K-a$ numărul de mari, distribuţia perechii $(a,b)$ se obţine printr-un DP simplu ($q\[a]\[b]$).



2\. Pentru o pereche fixă $(a,b)$, care este probabilitatea ca toate culorile să fie distincte?



\---



Răspunsul final se obţine prin sumarea peste toate combinaţiile posibile $(a,b)$:



`Răspuns = sum\_{a=0..K} q\[a]\[K-a] \* (1 - p\[a]\[K-a])`



unde



\* $q\[a]\[b]$ – probabilitatea ca în cele K alegeri să existe exact $a$ şosete mici și $b$ şosete mari;

\* $p\[a]\[b]$ – probabilitatea, condiţionată de existenţa acelei repartizări de dimensiuni, că toate culorile sunt diferite.



\---



\## 3. Calculul distribuţiei $q\[a]\[b]$



Să notăm



\* $A$ – numărul total de şosete mici,

\* $B$ – numărul total de şosete mari,

\* $w\_S = sizeSmall$, $w\_B = sizeBig$.



Definim



`q\[i]\[j] = Pr(după i+j alegeri am luat i mici şi j mari)`



Starea iniţială este



`q\[0]\[0] = 1`



Dintr-o stare $(i,j)$ greutatea totală rămasă este



`W = (A-i) \* w\_S + (B-j) \* w\_B`



Probabilitatea de a alege o şosetă mică este



`((A-i) \* w\_S) / W`



iar cea de a alege o şosetă mare este



`((B-j) \* w\_B) / W`



Tranzițiile DP:



```text

q\[i+1]\[j] += q\[i]\[j] \* ((A-i) \* w\_S) / ((A-i) \* w\_S + (B-j) \* w\_B)

q\[i]\[j+1] += q\[i]\[j] \* ((B-j) \* w\_B) / ((A-i) \* w\_S + (B-j) \* w\_B)

````



\---



\## 4. Probabilitatea ca toate culorile să fie diferite



\### 4.1 Datele pe culori



Pentru fiecare culoare $c$:



\* $cntS\[c]$ – număr de şosete mici

\* $cntB\[c]$ – număr de şosete mari



\---



\### 4.2 Ce putem lua dintr-o culoare?



\* niciuna – 1 posibilitate

\* o mică – $cntS\[c]$ posibilități

\* o mare – $cntB\[c]$ posibilități



\---



\### 4.3 DP pentru submulţimi valide



`dp\[i]\[x]\[y] = numărul de moduri de a selecta x mici şi y mari`



Inițial:



`dp\[0]\[0]\[0] = 1`



Tranziții:



```text

dp\[i]\[x]\[y] = dp\[i-1]\[x]\[y]

&#x20;           + dp\[i-1]\[x-1]\[y] \* cntS\[i]

&#x20;           + dp\[i-1]\[x]\[y-1] \* cntB\[i]

```



\---



\### 4.4 Normalizarea



Numărul total de moduri:



`tot\[a]\[b] = C(A, a) \* C(B, b)`



Probabilitatea:



`p\[a]\[b] = dp\[M]\[a]\[b] / tot\[a]\[b]`



\---



\## Calculul probabilităţii finale



`P(cel puţin două egale) = 1 - sum q\[a]\[b] \* p\[a]\[b]`



sau



`P(cel puţin două egale) = sum q\[a]\[b] \* (1 - p\[a]\[b])`



\---



\## Complexitatea



\* DP dimensiuni: $O(A \\cdot B)$

\* DP culori: $O(M \\cdot A \\cdot B)$

\* Total: $O(N^3)$



\---



\## Concluzie



Prin descompunerea procesului în distribuția dimensiunilor și combinatorica culorilor, problema devine calculabilă exact. Formula finală:



`Răspuns = sum q\[a]\[K-a] \* (1 - p\[a]\[K-a])`



poate fi evaluată cu precizia cerută ($\\le 10^{-5}$).



```

