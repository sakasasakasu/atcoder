#include <bits/stdc++.h>
using namespace std;

int main() {
    string S;
    vector<int> C;
    cin >> S;

    int len  = S.size();
    for (int i = 0; i < S.size(); i++) {
        if (S.at(i) == 'C') C.push_back(i);
    }

    long long ans = 0;
    for (int i = 0; i < C.size(); i++) {
        ans += 1;
        ans += min(C.at(i), len - 1 - C.at(i));
    }
    cout << ans << endl;
}
