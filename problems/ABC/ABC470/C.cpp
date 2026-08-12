#include <bits/stdc++.h>
#define rep(i, n) for (int i = 0; i < (n); i++)
using namespace std;

int main() {
    int N, Q;
    cin >> N >> Q;
    vector<int> A(N + 1, 0);
    set<int> active;
    int ans = 0;
    
    auto update = [&](int i, int new_val) {
        ans ^= A.at(i);
        A.at(i) = new_val;
        ans ^= A.at(i);
    };

    while(Q--) {
        int type;
        cin >> type;
        if (type == 1) {
            int X;
            cin >> X;

            update(X, A.at(X) + 1);
            active.insert(X);

        } else if (type == 2) {
            vector<int> to_remove;
            for (int idx : active) {
                update(idx, A.at(idx) - 1);
                if (A.at(idx) == 0) {
                    to_remove.push_back(idx);
                }
            }

            for (int idx : to_remove) {
                active.erase(idx);
            }
        }

        cout << ans << endl;
    }

    return 0;
}
