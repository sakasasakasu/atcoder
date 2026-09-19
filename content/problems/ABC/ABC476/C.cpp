#include <bits/stdc++.h>
#define rep(i, n) for (int i = 0; i < (n); i++)
using namespace std;

int main() {
    int N;
    cin >> N;
    vector<long long> A(N);
    rep(i, N) cin >> A.at(i);
    multiset<long long> set;
    set.insert(A.at(0));
    set.insert(A.at(1));
    for (int i = 2; i < N; i++) {
        set.insert(A.at(i));
        auto it = set.end();
        it--;
        it--;
        it--;
        cout << *it << endl;
    }
    return 0;
}
