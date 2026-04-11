\# Editorial – Probabilitatea de a avea două șosete de aceeași culoare



\## Ce trebuie să calculăm ?



Alex extrage $K$ șosete dintr-un sertar cu $N$ șosete.



Fiecare șosetă are:



\* o culoare $color\_i \\in \[1 \\dots N]$

\* o dimensiune – mică ($sizeSmall$) sau mare ($sizeBig$)



În momentul în care în sertar mai rămân $p$ șosete cu dimensiunile $s\_1,\\dots,s\_p$ (fiecare $s\_i$ este $sizeSmall$ sau $sizeBig$), șoseta $i$ este aleasă cu probabilitatea



$$

\\frac{s\_i}{s\_1+s\_2+\\dots+s\_p}.

$$



După ce Alex a luat exact $K$ șosete, dorim probabilitatea ca cel puțin două dintre ele să aibă aceeași culoare (dimensiunea nu contează).



\---



\## Ideea generală



Problema se poate despărţi în două părţi independente:



1\. \*\*Compoziţia dimensiunilor\*\* – câte din cele $K$ șosete sunt mici și câte sunt mari.

2\. \*\*Coliziunea de culori\*\* – dată o combinație $(a,b)$ de $a$ mici şi $b$ mari, care este probabilitatea ca toate culorile să fie diferite?



Răspunsul final este:



$$

\\boxed{\\displaystyle \\text{Ans}= \\sum\_{a+b=K} q\[a]\[b];\\bigl(1-p\[a]\[b]\\bigr)}

$$



unde



\* $q\[a]\[b]$ – probabilitatea ca în cele $K$ alegeri să fie exact $a$ șosete mici și $b$ mari

\* $p\[a]\[b]$ – probabilitatea ca toate culorile să fie distincte



\---



\## 2. Probabilitatea de a obține o anumită compoziție $(a,b)$



Numărul total de șosete mici este $A$, iar al celor mari este $B$.



La fiecare pas, dacă încă nu am luat $i$ mici și $j$ mari, rămân:



\* $A-i$ mici

\* $B-j$ mari



cu greutăţi:



$$

W\_{small}= (A-i)\\cdot sizeSmall,\\qquad W\_{big}= (B-j)\\cdot sizeBig.

$$



Probabilitatea de a alege o șosetă mică:



$$

\\frac{W\_{small}}{W\_{small}+W\_{big}}

$$



iar pentru mare este complementul.



DP-ul:



```

q\[0]\[0] = 1

for i = 0…A

&#x20; for j = 0…B

&#x20;   // alegem încă o mică

&#x20;   q\[i+1]\[j] += q\[i]\[j] \* ( (A-i)\*sizeSmall ) /

&#x20;                ( (A-i)\*sizeSmall + (B-j)\*sizeBig )



&#x20;   // alegem încă o mare

&#x20;   q\[i]\[j+1] += q\[i]\[j] \* ( (B-j)\*sizeBig )  /

&#x20;                ( (A-i)\*sizeSmall + (B-j)\*sizeBig )

```



După $K$ paşi, $q\[a]\[b]$ (cu $a+b=K$) este probabilitatea dorită.



Complexitate: $O(A\\cdot B) \\le O(N^2)$



\---



\## 3. Probabilitatea ca toate culorile să fie diferite $p\[a]\[b]$



Pentru fiecare culoare $c$:



\* $cntA\[c]$ – număr de mici

\* $cntB\[c]$ – număr de mari



Vrem să alegem $a$ mici și $b$ mari fără repetări de culoare.



\---



\### DP peste culori



$$

DP\[0]\[0]\[0] = 1

$$



Tranziții:



```

for each colour c = 1…C

&#x20; for a = 0…A

&#x20;   for b = 0…B

&#x20;     DP\[c]\[a]\[b] = DP\[c-1]\[a]\[b]



&#x20;     if a>0

&#x20;       DP\[c]\[a]\[b] += DP\[c-1]\[a-1]\[b] \* cntA\[c] \* a



&#x20;     if b>0

&#x20;       DP\[c]\[a]\[b] += DP\[c-1]\[a]\[b-1] \* cntB\[c] \* b

```



Factorii $a$ și $b$ apar deoarece alegem poziția în aranjament.



\---



\### Numărul total de aranjamente



$$

\\text{tot}\[a]\[b] = A\\cdot (A-1)\\dots (A-a+1);\\times; B\\cdot (B-1)\\dots (B-b+1)

$$



Prin urmare:



$$

p\[a]\[b] = \\frac{DP\[C]\[a]\[b]}{\\text{tot}\[a]\[b]}

$$



Complexitate: $O(C\\cdot A\\cdot B) \\le O(N^3)$



\---



\## 4. Combinarea rezultatelor



Pentru fiecare $(a,b)$ cu $a+b = K$:



```

contrib = q\[a]\[b] \* (1 - p\[a]\[b])

Ans    += contrib

```



unde



$$

1 - p\[a]\[b]

$$



este probabilitatea de coliziune.



\---



\## Complexitate și precizie



\* Timp: $O(N^3)$

\* Memorie: $\\sim O(N^3)$

\* Precizie: eroare absolută $\\le 10^{-5}$



\---



\## Ideea cheie



\* separăm dimensiunea de culoare

\* calculăm independent distribuția $q\[a]\[b]$

\* numărăm combinațiile valide cu DP

\* combinăm cu legea probabilităților totale



