#include <bits/stdc++.h>
#define rep(i, n) for (int i = 0; i < (n); i++)
using namespace std;

int main() {
    int N;
    cin >> N;
    vector<string> S(N);
    rep(i, N) {
        string string;
        cin >> string;
        transform(string.begin(), string.end(), string.begin(), [](unsigned char c) {return toupper(c);});
        S.at(i) = string;
    }
    vector<int> ans(N, 0);
    rep(i, N) {
        rep(j, N) {
            if (S.at(i) == S.at(j)) {
                ans.at(i)++;
            }
        }
    }

    cout << *max_element(ans.begin(), ans.end()) << endl;
    return 0;
}
