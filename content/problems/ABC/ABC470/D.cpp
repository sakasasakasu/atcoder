#include <bits/stdc++.h>
#define rep(i, n) for (int i = 0; i < (n); i++)
using namespace std;

int main() {
    int N, Query;
    cin >> N >> Query;
    vector<int> P(N), Q(N);
    rep(i, N) {
        cin >> P[i];
        P.at(i)--;
        Q.at(P.at(i)) = i;
    }

    while(Query--) {
        int type;
        cin >> type;

        if (type == 1) {
            int x, y;
            cin >> x >> y;
            x--; y--;
            swap(P.at(x), P.at(y));
            swap(Q.at(P.at(x)), Q.at(P.at(y)));
        } else if (type == 2) {
            swap(P, Q);
        }
    }
    rep(i, N) cout << P.at(i) + 1 << " \n"[i + 1 == N];
}
