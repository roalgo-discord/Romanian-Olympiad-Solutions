// Andrei Constantinescu - minimum cut (100 points)
// 1 <= N, M <= 1 000
// 0 <= costs <= 1 000 000
// Note: Failed asserts shall be treated as either invalid tests or faulty implementation of the solution,
// depending on the line of the fail.
#include <bits/stdc++.h>
#define int long long

using namespace std;

//Plain Maximum Flow class, don't read unless necessary
template <const int NMAX, const int MMAX>
class MaxFlow {
public:
    MaxFlow() { m = 0; }

    inline void setN(int _n) { n = _n; }
    inline void setS(int _s) { s = _s; }
    inline void setT(int _t) { t = _t; }

    inline int getN() { return n; }
    inline int getS() { return s; }
    inline int getT() { return t; }

    void clear() {
        m = 0;
        for (int i = 1; i <= n; ++ i)
            graph[i].clear();
    }

    void reset() {
        for (int i = 0; i < m; ++ i)
            edges[i].flow = 0;
    }

    void addEdge(int from, int to, int cap) {
        edges[m ++] = Edge(from, to, 0, cap);
        edges[m ++] = Edge(to, from, 0, 0);

        graph[from].push_back(m - 2);
        graph[to].push_back(m - 1);
    }

    inline int computeFlow() {
        return Dinic();
    }

    bool vis[NMAX];
private:
    struct Edge {
        int from, to;
        int flow, cap;

        Edge(int _from = 0, int _to = 0, int _flow = 0, int _cap = 0):
            from(_from), to(_to), flow(_flow), cap(_cap) {}
        inline int other(int node) {
            return from ^ to ^ node;
        }
    };

    int n, m, s, t;

    vector <int> graph[NMAX];
    Edge edges[2 * MMAX];

    int father[NMAX];
    queue <int> _queue;

    bool bfs() {
        memset(vis, 0, (n + 1) * sizeof(bool));

        vis[s] = true;
        _queue.push(s);

        int node;
        while (!_queue.empty()) {
            node = _queue.front();
            _queue.pop();

            if (node == t)
                continue;

            for (auto it: graph[node])
                if (!vis[edges[it].other(node)] && edges[it].flow < edges[it].cap) {
                    father[edges[it].other(node)] = it;
                    vis[edges[it].other(node)] = true;
                    _queue.push(edges[it].other(node));
                }
        }

        return vis[t];
    }

    int Dinic() {
        int flow = 0;
        int cnt = 0;
        while (bfs()) {
            ++ cnt;
            if (cnt == 30)
                break;
            for (auto it: graph[t])
                if (vis[edges[it ^ 1].other(t)] && edges[it ^ 1].flow < edges[it ^ 1].cap) {
                    int node = edges[it ^ 1].other(t);
                    int minimum = edges[it ^ 1].cap - edges[it ^ 1].flow;

                    while (node != s) {
                        minimum = min(minimum, edges[father[node]].cap - edges[father[node]].flow);
                        node = edges[father[node]].other(node);
                    }

                    node = edges[it ^ 1].other(t);
                    edges[it ^ 1].flow += minimum;
                    edges[it].flow -= minimum;
                    flow += minimum;

                    while (node != s) {
                        edges[father[node]].flow += minimum;
                        edges[father[node] ^ 1].flow -= minimum;

                        node = edges[father[node]].other(node);
                    }
                }
        }

        return flow;
    }
};

const int NMAX = 1000; //= MMAX
const int VMAX = 1000000000;

int N;
pair <int, int> clothes[NMAX + 5];
int M;
tuple <int, int, int, int> outfits[NMAX + 5];

void read() {
    cin >> N >> M;
    assert(1 <= N && N <= NMAX && 1 <= M && M <= NMAX);
    for (int i = 1; i <= N; ++ i) {
        assert(cin >> clothes[i].first >> clothes[i].second);
        assert(1 <= clothes[i].first && clothes[i].first <= 3);
        assert(0 <= clothes[i].second && clothes[i].second <= VMAX);
    }
    for (int i = 1; i <= M; ++ i) {
        int A, B, C, W;
        assert(cin >> A >> B >> C >> W);
        outfits[i] = make_tuple(A, B, C, W);
        assert(1 <= A && A <= N && 1 <= B && B <= N && 1 <= C && C <= N);
        assert(clothes[A].first == 1 && clothes[B].first == 2 && clothes[C].first == 3);
    }
}

void solveMaxFlow() {
    MaxFlow <2 * NMAX + 5, 5 * NMAX + 5> f;

    const int S = N + M + 1, T = N + M + 2;
    const int INF = 1.5E9 + 256;
    f.setN(N + M + 2);
    f.setS(S), f.setT(T);

    int costOfOutfits = 0;
    for (int i = 1; i <= M; ++ i) {
        costOfOutfits += get<3>(outfits[i]);
        f.addEdge(S, i, get<3>(outfits[i]));
        f.addEdge(i, M + get<0>(outfits[i]), INF);
        f.addEdge(i, M + get<1>(outfits[i]), INF);
        f.addEdge(i, M + get<2>(outfits[i]), INF);
    }

    for (int i = 1; i <= N; ++ i)
        f.addEdge(M + i, T, clothes[i].second);

    int ans = costOfOutfits - f.computeFlow();
   // assert(0 <= ans && ans <= 1000000000);

    vector <int> sol;
    for (int i = 1; i <= N; ++ i)
        if (f.vis[M + i])
            sol.push_back(i);

    cout << ans << '\n';// << sol.size() << '\n';
    //for (int i = 0; i < sol.size(); ++ i)
    //    cout << sol[i] << " \n"[i + 1 == sol.size()];
}

int32_t main()
{
    freopen("fashion.in", "r", stdin);
    freopen("fashion.out", "w", stdout);

    read();
    solveMaxFlow();
    return 0;
}