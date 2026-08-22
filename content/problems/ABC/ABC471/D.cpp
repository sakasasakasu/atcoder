#include <bits/stdc++.h>
#define rep(i, n) for (int i = 0; i < (n); i++)
using ll = long long;
using namespace std;

int main() {
    int Q, V;
    cin >> Q >> V;
    priority_queue<int> pq;
    rep(i, Q) {
        int type, t;
        cin >> type >> t;
        if (type == 1) {
            ll w;
            cin >> w;
            pq.push(w-t);
        } else {
            if (pq.size() == 0) {
                cout << -1 << endl;
            } else {
                ll ans = pq.top() + t;
                pq.pop();
                cout << min(ans, (ll)V) << endl;
            }
        }
    }
    return 0;
}
