#include <bits/stdc++.h>
#define rep(i, n) for (int i = 0; i < (n); i++)
using ll = long long;
using namespace std;

int main() {
    int N;
    cin >> N;
    set<int> s;
    rep(i, N) {
        int ai;
        cin >> ai;
        s.insert(ai);
    }

    ll ans = 0;
    int pos = 0;
    rep(i, N) {
        auto it = s.lower_bound(pos);
        int next;
        if (it == s.begin()) {
            next = *it;
        } else if (it == s.end()) {
            next = *--it;
        } else {
            int cand1 = *it;
            int cand2 = *--it;
            if (abs(cand1 - pos) < abs(cand2 - pos)) {
                next = cand1;
            } else {
                next = cand2;
            }
        }
        ans += abs(next - pos);
        s.erase(next);
        pos = next;
    }
    cout << ans << endl;
    return 0;
}
