#include <stdio.h>

//begin================================================================================

#include <bits/stdc++.h>

using namespace std;

const int NMAX = 150000;

int N, father[NMAX + 5], restriction[NMAX + 5];
vector <int> graph[NMAX + 5];

int dp[NMAX + 5];
void computeDp(int node, int h = 0) {
    dp[node] = restriction[node] - h;
    for (auto it: graph[node]) {
        computeDp(it, h + 1);
        dp[node] = min(dp[node], dp[it]);
    }
}

priority_queue <pair <int, int> > pq;
void goDown(int node) {
    int minimum = 2E9, minimumNode = -1;
    for (auto it: graph[node])
        if (dp[it] < minimum)
            minimum = dp[it], minimumNode = it;

    if (minimumNode != -1) {
        for (auto it: graph[node])
            if (it != minimumNode)
                pq.push({-dp[it], it});
        goDown(minimumNode);
    }
}

bool solution(const int _N, const int *_father, const int *_restriction) {
    // Copy stuff
    N = _N;
    assert(1 <= N && N <= NMAX);
    for (int i = 2; i <= N; ++ i)
        father[i] = _father[i];
    for (int i = 1; i <= N; ++ i)
        restriction[i] = _restriction[i], graph[i].clear();
    while (!pq.empty())
        pq.pop();

    // Build tree
    for (int i = 2; i <= N; ++ i)
        graph[father[i]].push_back(i);

    // Compute DP
    computeDp(1);

    //Solve
    pq.push({-dp[1], 1});
    int step = -1;
    while (!pq.empty()) {
        ++ step;
        int node = pq.top().second;
        pq.pop();

        if (step > dp[node]) {
            return 0; 
        } 
        goDown(node);
    }
    return 1;
}

//end==================================================================================================


int main()
{
	int t;
	fread(&t, 1, sizeof(int), stdin);
	
	int *F = (int*)malloc((150000 + 1) * sizeof(int));
	int *T = (int*)malloc((150000 + 1) * sizeof(int));
	for(int i=1; i<=t; i++)
	{
		int n;
		fread(&n, 1, sizeof(int), stdin);

        fread(F + 2, n - 1, sizeof(int), stdin);
	    fread(T + 1, n, sizeof(int), stdin);

	    if (solution(n, F, T))
            printf("YES\n");
        else
            printf("NO\n");
	}
	free(F);
	free(T);
	return 0;
}