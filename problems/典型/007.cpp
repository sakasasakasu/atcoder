#include <bits/stdc++.h>
using namespace std;

int main() {
    int N;
    cin >> N;
    vector<int> A(N);
    for (int i = 0; i < N; i++) cin >> A.at(i);
    int Q;
    cin >> Q;

    sort(A.begin(), A.end());

    while(Q--) {
        int B;
        cin >> B;
        
        auto it = lower_bound(A.begin(), A.end(), B);

        long long ans = 2e18;

        if (it != A.end()) {
            ans = min(ans, (long long)abs(*it - B));
        }

        if (it != A.begin()) {
            ans = min(ans, (long long)abs(*prev(it) - B));
        }
        
        cout << ans << endl;
    }
}
